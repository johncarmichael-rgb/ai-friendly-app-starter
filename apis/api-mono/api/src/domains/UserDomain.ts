import { NodegenRequest, User, UserCompany, UserCurrentPutPut } from '@/http/nodegen/interfaces';
import { UserDomainInterface } from '@/http/nodegen/domainInterfaces/UserDomainInterface';
import UserRepository from '@/database/UserRepository';
import { NotFoundException } from '@/http/nodegen/errors/NotFoundException';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';

class UserDomain implements UserDomainInterface {
  public async userCurrentGet(req: NodegenRequest): Promise<UserCompany> {
    // Fetch user from MongoDB
    const user = await UserRepository.findById(req.sessionData.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const companyMemberships = await CompanyMemberRepository.findByUser(user._id);

    // Sort memberships so the session's selected company appears first.
    // Frontends pick [0] to determine the active company context.
    const selectedCompanyId = req.sessionData.companyId;
    if (selectedCompanyId) {
      companyMemberships.sort((a, b) => {
        if (a.companyId === selectedCompanyId) {
          return -1;
        }
        if (b.companyId === selectedCompanyId) {
          return 1;
        }
        return 0;
      });
    }

    return {
      user,
      companyMemberships,
    };
  }

  async userCurrentPut(body: UserCurrentPutPut, req: NodegenRequest): Promise<User> {
    // Update the current user's profile
    const updatedUser = await UserRepository.update({
      _id: req.sessionData.userId,
      updates: body,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}

export default new UserDomain();
