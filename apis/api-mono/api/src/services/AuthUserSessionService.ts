import express from 'express';
import UserRepository from '@/database/UserRepository';
import CompanyRepository from '@/database/CompanyRepository';
import SessionService from '@/services/SessionService';
import { AuthUserData } from '@/services/AuthUserData';

import { BadRequestException } from '@/http/nodegen/errors';
import { SessionClass } from '@/database/models/SessionModel';
import { CompanyClass } from '@/database/models/CompanyModel';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import { Status } from '@/http/nodegen/interfaces/CompanyMember';
import config from '@/config';
import { User } from '@/http/nodegen/interfaces';
import { DEFAULT_COMPANY_MEMBER_ROLE, SYSTEM_SUPER_ADMIN } from '@/constants/ROLES';
import ImmutableEmailService from '@/services/email/ImmutableEmailService';

/**
 * AuthUserSessionService
 *
 * Handles all database and session operations for authenticated users.
 *
 * Responsibilities:
 * - Find or create users based on authenticated user data
 * - Create companies for new users
 * - Manage sessions and cookies
 * - Attach session data to requests
 */
class AuthUserSessionService {
  /**
   * Handle complete user and session setup for an authenticated request.
   *
   * Flow:
   * 1. Find or create user (and company if needed)
   * 2. Find or create session (for tracking/analytics)
   * 3. Return session data to attach to request
   *
   * @param userData - Validated user data from WorkOS or dev auto-seed
   * @param req - Express request (for IP and user agent), or connection metadata for WebSocket
   * @returns Session data to attach to request
   */
  async handleAuthenticatedUser(
    userData: AuthUserData,
    req?: express.Request | { ipAddress?: string; userAgent?: string },
  ): Promise<SessionClass> {
    const { _id } = await this.findOrCreateUser(userData);
    return SessionService.findOrCreateSession(_id, req);
  }

  /**
   * Find or create user based on authenticated user data.
   *
   * Flow:
   * 1. Look up user by email (stable across identity providers)
   * 2. If user exists, update externalId if changed and return user
   * 3. If user doesn't exist:
   *    - Extract email domain
   *    - Look up company by domain
   *    - If company found, create user and assign to that company
   *    - If no company found, create the user with no membership (the
   *      select-company flow 403s until an admin provisions one)
   *
   * @param authUser - Validated user data
   * @returns User document
   */
  // eslint-disable-next-line max-lines-per-function
  private async findOrCreateUser(authUser: AuthUserData): Promise<User> {
    let user = await UserRepository.findByEmail(authUser.email);

    if (user) {
      // Update externalId if it has changed (e.g. switching identity providers)
      if (user.externalId !== authUser.sub) {
        console.log(`🔄 Updating externalId for user (${user._id}) from "${user.externalId}" to "${authUser.sub}"`);
        await UserRepository.update({ _id: user._id, updates: { externalId: authUser.sub } });
      }
      console.verbose(`✅ Existing user found and returning: (${user._id})`);
      return user;
    }

    if (this.isSuperAdminEmail(authUser.email)) {
      console.log('New user is SUPER_ADMIN, creating SUPER_ADMIN user');
      return this.createSuperAdminUser(authUser);
    }

    // User doesn't exist - look up company by email domain
    console.verbose(`🆕 New user attempting to sign in: ${authUser.email}`);

    // Extract email domain
    const emailDomain = authUser.email.split('@')[1];
    if (!emailDomain) {
      throw new BadRequestException('Invalid email format - no domain found');
    }

    // Look up company by domain
    const company: CompanyClass | null = await CompanyRepository.findByDomain(emailDomain);

    const { firstName, lastName } = this.parseUserName(authUser);

    if (!company) {
      // No tenant matches this email domain — create the user with no
      // membership. The select-company flow answers with a clear 403 for
      // memberless users; an admin must provision their membership.
      console.log(`🆕 No company for domain ${emailDomain} — creating membership-less user`);
      user = await UserRepository.create({
        email: authUser.email,
        firstName,
        lastName,
        externalId: authUser.sub,
        avatar: authUser.picture,
        displayName: authUser.name,
        createdBy: 'system',
      });
      return user;
    }

    console.log(`🏢 Company found for domain ${emailDomain}: ${company?.name} (${company?._id})`);

    // Create user and assign to company
    user = await UserRepository.create({
      email: authUser.email,
      firstName,
      lastName,
      externalId: authUser.sub,
      avatar: authUser.picture,
      displayName: authUser.name,
      createdBy: 'system',
    });
    await CompanyMemberRepository.create({
      companyId: company._id,
      userId: user._id,
      name: `${firstName} ${lastName}`,
      invitedAt: new Date(),
      joinedAt: new Date(),
      status: Status.Active,
      invitedBy: 'system',
      role: DEFAULT_COMPANY_MEMBER_ROLE.name,
      isExternal: false,
    });

    // Send welcome email to new user
    ImmutableEmailService.welcome({
      email: user.email,
      firstName,
      lastName,
    });

    return user;
  }

  isSuperAdminEmail(email: string) {
    return config.devAuth.superAdminEmails.includes(email);
  }

  parseUserName(authUser: AuthUserData): {
    firstName: string;
    lastName: string;
  } {
    // Parse name into first and last name
    // 'bob.smith@domain.com' -> Bob Smith
    let nameToParse = authUser.name;

    // If no name provided, extract from email
    if (!nameToParse || nameToParse.trim() === '') {
      const emailUsername = authUser.email.split('@')[0];
      // Replace dots, underscores, hyphens with spaces
      nameToParse = emailUsername.replace(/[._-]/g, ' ');
    }

    // Split by spaces and filter out empty strings
    const nameParts = nameToParse
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);

    // Capitalize first letter of each part
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const firstName = nameParts.length > 0 ? capitalize(nameParts[0]) : 'User';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).map(capitalize).join(' ') : 'User';

    return {
      firstName,
      lastName,
    };
  }

  async createSuperAdminUser(authUser: AuthUserData): Promise<User> {
    const { firstName, lastName } = this.parseUserName(authUser);

    return UserRepository.create({
      email: authUser.email,
      firstName,
      lastName,
      externalId: authUser.sub,
      avatar: authUser.picture,
      displayName: authUser.name,
      createdBy: 'system',
      roles: [SYSTEM_SUPER_ADMIN],
    });
  }
}

export default new AuthUserSessionService();
