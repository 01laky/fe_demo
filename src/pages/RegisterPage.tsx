import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import { FormField } from '../components/radix/FormField';
import { Input } from '../components/radix/Input';
import { Button } from '../components/radix/Button';
import './RegisterPage.scss';

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function RegisterPage() {
  const { t } = useTranslation('common');

  // Create validation schema with yup
  const validationSchema = yup.object({
    email: yup
      .string()
      .required(t('pages.register.validation.emailRequired'))
      .email(t('pages.register.validation.emailInvalid')),
    password: yup
      .string()
      .required(t('pages.register.validation.passwordRequired'))
      .min(4, t('pages.register.validation.passwordMinLength'))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('pages.register.validation.passwordPattern')),
    firstName: yup
      .string()
      .required(t('pages.register.validation.firstNameRequired'))
      .min(2, t('pages.register.validation.firstNameMinLength')),
    lastName: yup
      .string()
      .required(t('pages.register.validation.lastNameRequired'))
      .min(2, t('pages.register.validation.lastNameMinLength')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      logger.info('Register form submitted', { email: data.email });
      // TODO: Implement registration logic with API
      // For now, just log
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info('Registration successful', { email: data.email });
    } catch (error) {
      logger.error('Registration failed', error);
      // Error will be shown via toast or other error handling mechanism
    }
  };

  return (
    <div className="register-page-wrapper">
      <Container className="h-100">
        <Row className="h-100">
          <Col xs={12} className="d-flex align-items-center justify-content-center">
            <div className="register-card">
              <h2 className="register-title">{t('pages.register.title')}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                <FormField
                  label={t('pages.register.email')}
                  htmlFor="email"
                  required
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={isSubmitting}
                    error={!!errors.email}
                    placeholder={t('pages.register.email')}
                  />
                </FormField>

                <FormField
                  label={t('pages.register.password')}
                  htmlFor="password"
                  required
                  error={errors.password?.message}
                >
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    disabled={isSubmitting}
                    error={!!errors.password}
                    placeholder={t('pages.register.password')}
                  />
                </FormField>

                <FormField
                  label={t('pages.register.firstName')}
                  htmlFor="firstName"
                  required
                  error={errors.firstName?.message}
                >
                  <Input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    disabled={isSubmitting}
                    error={!!errors.firstName}
                    placeholder={t('pages.register.firstName')}
                  />
                </FormField>

                <FormField
                  label={t('pages.register.lastName')}
                  htmlFor="lastName"
                  required
                  error={errors.lastName?.message}
                >
                  <Input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    disabled={isSubmitting}
                    error={!!errors.lastName}
                    placeholder={t('pages.register.lastName')}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="register-submit-button"
                >
                  {isSubmitting
                    ? t('pages.register.submitting') || 'Registering...'
                    : t('pages.register.submit')}
                </Button>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
