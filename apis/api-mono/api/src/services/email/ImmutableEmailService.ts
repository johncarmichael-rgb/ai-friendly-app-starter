import Emailer from '@/services/email/Emailer';
import config from '@/config';

class ImmutableEmailService {
  /**
   * system emails
   */
  async systemEmail(content: any = {}, rmqOpId: string) {
    const subject: string = config.env.toUpperCase() + ': ';
    void Emailer.send({
      to: {
        email: config.email.techEmail,
        name: `${config.appDetails.name} Support team`,
      },
      subject: subject,
      tplObject: {
        fromOperation: rmqOpId,
        env: config.env,
        providedContent: content,
      },
      tplRelativePath: 'support/generalSystemError',
    }).catch(console.error);
  }

  welcome(user: { email: string; firstName: string; lastName: string }) {
    void Emailer.send({
      to: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      tplObject: {
        firstName: user.firstName,
      },
      tplRelativePath: 'user/welcome',
    }).catch(console.error);
  }
}

export default new ImmutableEmailService();
