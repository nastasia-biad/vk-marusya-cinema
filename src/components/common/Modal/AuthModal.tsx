import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { closeAuthModal } from '../../../store/slices/uiSlice';
import { loginUser, registerUser, clearError } from '../../../store/slices/authSlice';
import Loading from '../Loading/Loading';
import './AuthModal.scss';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch(clearError());
    setErrors({});
    setTouchedFields([]);
  }, [isLogin, dispatch]);

  const handleClose = () => {
    dispatch(closeAuthModal());
    dispatch(clearError());
    setErrors({});
    setTouchedFields([]);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!isLogin && !value.trim()) {
          return 'Имя обязательно';
        }
        if (!isLogin && value.length < 2) {
          return 'Имя должно быть не менее 2 символов';
        }
        return undefined;
        
      case 'lastName':
        if (!isLogin && !value.trim()) {
          return 'Фамилия обязательна';
        }
        if (!isLogin && value.length < 2) {
          return 'Фамилия должна быть не менее 2 символов';
        }
        return undefined;
        
      case 'email':
        if (!value.trim()) {
          return 'Email обязателен';
        }
        if (!/\S+@\S+\.\S+/.test(value)) {
          return 'Некорректный email';
        }
        return undefined;
        
      case 'password':
        if (!value) {
          return 'Пароль обязателен';
        }
        if (!isLogin && value.length < 6) {
          return 'Пароль должен быть не менее 6 символов';
        }
        return undefined;
        
      case 'confirmPassword':
        if (!isLogin && !value) {
          return 'Подтвердите пароль';
        }
        if (!isLogin && value !== formData.password) {
          return 'Пароли не совпадают';
        }
        return undefined;
        
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!isLogin) {
      newErrors.firstName = validateField('firstName', formData.firstName);
      newErrors.lastName = validateField('lastName', formData.lastName);
    }
    
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    
    if (!isLogin) {
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allFields = isLogin 
      ? ['email', 'password']
      : ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    
    const uniqueFields: string[] = [];
    const allFieldsToAdd = [...touchedFields, ...allFields];
    
    for (const field of allFieldsToAdd) {
      if (!uniqueFields.includes(field)) {
        uniqueFields.push(field);
      }
    }
    
    setTouchedFields(uniqueFields);
    
    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();
    } else {
      await dispatch(registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      })).unwrap();
    }
    
    handleClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (!touchedFields.includes(name)) {
      setTouchedFields(prev => [...prev, name]);
    }
    
    if (touchedFields.includes(name)) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (!touchedFields.includes(name)) {
      setTouchedFields(prev => [...prev, name]);
    }
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setTouchedFields([]);
    dispatch(clearError());
  };

  const shouldShowError = (fieldName: string): boolean => {
    return touchedFields.includes(fieldName) && !!errors[fieldName as keyof FormErrors];
  };

  if (isLoading) {
    return (
      <div className="auth-modal-overlay" onClick={handleClose}>
        <div className="auth-modal-container">
          <div className="auth-modal">
            <Loading message="Загрузка..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal-container">
        {/* Кнопка закрытия для мобильной версии */}
        {isMobile && (
          <button className="auth-modal__close-mobile" onClick={handleClose}>
            <img src="/assets/icons/close.svg" alt="Закрыть" />
          </button>
        )}
        
        {/* Кнопка закрытия для десктопа */}
        {!isMobile && (
          <button className="auth-modal__close" onClick={handleClose}>
            <img src="/assets/icons/close.svg" alt="Закрыть" className="auth-modal__close-icon" />
          </button>
        )}
        
        <div className="auth-modal-wrapper">
          <div 
            className={`auth-modal ${isMobile ? 'auth-modal--mobile' : ''} ${isLogin ? 'auth-modal--login' : 'auth-modal--register'}`} 
            onClick={e => e.stopPropagation()}
          >
            {/* Логотип Маруся */}
            <div className="auth-modal__logo">
              <img 
                src={isMobile ? "/assets/icons/marusya-black.svg" : "/assets/icons/marusya-black.svg"} 
                alt="Marusya" 
                className="auth-modal__logo-image"
              />
            </div>

            {/* Заголовок формы - только для регистрации */}
            {!isLogin && (
              <h2 className="auth-modal__title">
                Регистрация
              </h2>
            )}

            {/* Форма */}
            <div className="auth-modal__form-wrapper">
              <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
                {!isLogin ? (
                  // Форма регистрации
                  <div className="auth-modal__inputs-group">
                    {/* Электронная почта */}
                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('email') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/email.svg" alt="Email" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Электронная почта"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required
                        />
                      </div>
                      {shouldShowError('email') && (
                        <div className="auth-modal__error-text">{errors.email}</div>
                      )}
                    </div>

                    {/* Имя */}
                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('firstName') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/user.svg" alt="Имя" />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          placeholder="Имя"
                          value={formData.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required={!isLogin}
                        />
                      </div>
                      {shouldShowError('firstName') && (
                        <div className="auth-modal__error-text">{errors.firstName}</div>
                      )}
                    </div>

                    {/* Фамилия */}
                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('lastName') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/user.svg" alt="Фамилия" />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Фамилия"
                          value={formData.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required={!isLogin}
                        />
                      </div>
                      {shouldShowError('lastName') && (
                        <div className="auth-modal__error-text">{errors.lastName}</div>
                      )}
                    </div>

                    {/* Пароль */}
                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('password') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/password.svg" alt="Пароль" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          placeholder="Пароль"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required
                        />
                      </div>
                      {shouldShowError('password') && (
                        <div className="auth-modal__error-text">{errors.password}</div>
                      )}
                    </div>

                    {/* Подтвердите пароль */}
                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('confirmPassword') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/password.svg" alt="Подтвердите пароль" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          placeholder="Подтвердите пароль"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required={!isLogin}
                        />
                      </div>
                      {shouldShowError('confirmPassword') && (
                        <div className="auth-modal__error-text">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Форма входа
                  <div className="auth-modal__inputs-group">
                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('email') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/email.svg" alt="Email" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Электронная почта"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required
                        />
                      </div>
                      {shouldShowError('email') && (
                        <div className="auth-modal__error-text">{errors.email}</div>
                      )}
                    </div>

                    <div className="auth-modal__input-container">
                      <div className={`auth-modal__input ${shouldShowError('password') ? 'auth-modal__input--error' : ''}`}>
                        <div className="auth-modal__input-icon">
                          <img src="/assets/icons/password.svg" alt="Пароль" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          placeholder="Пароль"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="auth-modal__input-field"
                          required
                        />
                      </div>
                      {shouldShowError('password') && (
                        <div className="auth-modal__error-text">{errors.password}</div>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="auth-modal__form-error">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="auth-modal__submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
                </button>
              </form>

              <div className="auth-modal__switch">
                <span className="auth-modal__switch-text">
                  {isLogin ? 'Нет аккаунта?' : 'У меня есть пароль'}
                </span>
                <button 
                  type="button"
                  onClick={handleSwitchMode}
                  className="auth-modal__switch-btn"
                  disabled={isLoading}
                >
                  {isLogin ? 'Зарегистрироваться' : 'Войти'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;