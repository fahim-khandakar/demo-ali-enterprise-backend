import ApiError from '../../../errors/ApiError';
import { emailConfig } from '../constants/constants';

export const sendEmail = async <T>(
  to: string,
  emailHTMLTemplate: (props: T) => string,
  subject: string,
  templateProps: T,
): Promise<boolean> => {
  try {
    if (!to) throw new ApiError(400, 'Recipient email is required');

    await emailConfig.smtp.sendMail({
      from: {
        name: 'NEC Group',
        address: emailConfig.user || '',
      },
      to,
      subject,
      html: emailHTMLTemplate(templateProps),
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new ApiError(500, (error as Error).message);
  }
};
