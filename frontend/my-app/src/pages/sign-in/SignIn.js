import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { GoogleIcon, FacebookIcon } from './components/CustomIcons';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import FilterVintageIcon from '@mui/icons-material/FilterVintage';
import Alert from '@mui/material/Alert';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stepper, Step, StepLabel, CircularProgress, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LockReset as LockResetIcon } from '@mui/icons-material';
import { useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props) {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [apiError, setApiError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Tránh lỗi window is not defined bằng cách kiểm tra môi trường trước
  const isClient = typeof window !== 'undefined';
  const API_URL = isClient && window.location.protocol === 'https:'
    ? 'https://localhost:8443/api/auth'
    : 'http://localhost:8080/api/auth';
  
  const [formData, setFormData] = React.useState({
    emailOrPhone: '',
    password: '',
  });
  
  const [loading, setLoading] = React.useState(false);
  
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  
  // Thêm state cho forgot password dialog
  const [openForgotPassword, setOpenForgotPassword] = React.useState(false);
  const [forgotPasswordData, setForgotPasswordData] = React.useState({
    emailInput: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotPasswordError, setForgotPasswordError] = React.useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = React.useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const forgotPasswordFormRef = React.useRef(null);
  
  // Thêm state cho Google OAuth
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [facebookLoading, setFacebookLoading] = React.useState(false);
  
  const steps = ['Nhập email', 'Nhập mã xác nhận', 'Đặt lại mật khẩu'];

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setGoogleLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google User:', decoded);
   
      // Chuẩn bị dữ liệu người dùng
      const userData = {
        idToken: credentialResponse.credential,
        email: decoded.email,
        fullName: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
        picture: decoded.picture,
        googleId: decoded.sub
      };

      console.log('Sending user data:', userData);
   
      const response = await fetch(`${API_URL}/google-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });
   
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error('Đăng nhập Google thất bại: ' + errorData);
      }

      const data = await response.json();
      console.log('Login success:', data);

      if (!data.accessToken) {
        throw new Error('Token không hợp lệ từ server');
      }

      // Lưu thông tin user vào localStorage
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        picture: data.picture
      }));
   
      router.push('/dashboard');
    } catch (error) {
      console.error('Google Login Error:', error);
      setApiError('Đăng nhập Google thất bại: ' + error.message);
    } finally {
      setGoogleLoading(false);
    }
  };
  
  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setApiError('Đăng nhập Google thất bại, vui lòng thử lại');
    setGoogleLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateInputs = () => {
    const emailOrPhone = formData.emailOrPhone;
    const password = formData.password;

    let isValid = true;

    if (!emailOrPhone) {
      setEmailError(true);
      setEmailErrorMessage('Vui lòng nhập email hoặc số điện thoại.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailOrPhone) && !/^(0|\+84)[0-9]{9,10}$/.test(emailOrPhone.replace(/\s/g, ''))) {
      setEmailError(true);
      setEmailErrorMessage('Email hoặc số điện thoại không hợp lệ.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleOpenForgotPassword = () => {
    setOpenForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setOpenForgotPassword(false);
    setActiveStep(0);
    setForgotPasswordData({
      emailInput: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };
  
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (forgotPasswordError) setForgotPasswordError('');
  };

  const handleSendVerificationCode = async () => {
    console.log("🟢 handleSendVerificationCode is running...");
    
    if (!forgotPasswordData.emailInput) {
      console.error("❌ Lỗi: Chưa nhập email");
      setForgotPasswordError("Vui lòng nhập địa chỉ email");
      return;
    }
    
    console.log("🔹 Email đang gửi:", forgotPasswordData.emailInput);
    console.log("🔹 Gửi request đến API:", `${API_URL}/forgot-password`);
    
    const payload = { email: forgotPasswordData.emailInput };
    console.log("🔹 Request payload:", JSON.stringify(payload));
    
    setForgotPasswordLoading(true);
    try {
      try {
        console.log("🔍 Kiểm tra kết nối với API bằng ping...");
        const pingResponse = await fetch(`${API_URL}/ping`);
        console.log("🔍 Ping Response:", pingResponse.status, pingResponse.ok);
        if (pingResponse.ok) {
          console.log("✅ Kết nối API thành công!");
        }
      } catch (pingError) {
        console.error("❌ Không thể kết nối đến API:", pingError);
      }
      
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });
      
      console.log("📢 API Response Status:", response.status);
      console.log("📢 API Response OK:", response.ok);
      
      const data = await response.json();
      console.log("📢 API Response Data:", data);
      
      if (!response.ok) throw new Error(data.message || "Lỗi gửi mã xác nhận");
      
      setForgotPasswordSuccess("Mã xác nhận đã được gửi đến email của bạn");
      setActiveStep(1);
    } catch (err) {
      console.error("🚨 Lỗi gửi mã xác nhận:", err);
      setForgotPasswordError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!forgotPasswordData.verificationCode) {
      setForgotPasswordError('Vui lòng nhập mã xác nhận');
      return;
    }
    if (forgotPasswordData.verificationCode.length !== 6) {
      setForgotPasswordError('Mã xác nhận phải có 6 ký tự');
      return;
    }
    
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    
    try {
      console.log('Verifying code:', {
        email: forgotPasswordData.emailInput,
        code: forgotPasswordData.verificationCode
      });
      
      const response = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.emailInput,
          code: forgotPasswordData.verificationCode,
        }),
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Mã xác nhận không hợp lệ');
      }
      
      setForgotPasswordSuccess('Mã xác nhận hợp lệ');
      setActiveStep(2);
    } catch (err) {
      console.error('Error verifying code:', err);
      setForgotPasswordError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!forgotPasswordData.newPassword) {
      setForgotPasswordError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (forgotPasswordData.newPassword.length < 6) {
      setForgotPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setForgotPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    
    try {
      console.log('Resetting password:', {
        email: forgotPasswordData.emailInput,
        code: forgotPasswordData.verificationCode,
        newPassword: forgotPasswordData.newPassword
      });
      
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.emailInput,
          code: forgotPasswordData.verificationCode,
          newPassword: forgotPasswordData.newPassword,
        }),
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Không thể đặt lại mật khẩu');
      }
      
      setForgotPasswordSuccess('Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.');
      setTimeout(() => {
        handleCloseForgotPassword();
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setForgotPasswordError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (forgotPasswordLoading) return;
    
    console.log("✅ Form submitted at step:", activeStep);
    console.log("✅ Form data at submit:", forgotPasswordData);
    
    if (activeStep === 0) {
      console.log("🚀 Attempting to send verification code...");
      handleSendVerificationCode();
    } else if (activeStep === 1) {
      console.log("🚀 Attempting to verify code...");
      handleVerifyCode();
    } else if (activeStep === 2) {
      console.log("🚀 Attempting to reset password...");
      handleResetPassword();
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!validateInputs()) return;
  
    setLoading(true);
    setApiError('');
  
    try {
      const loginPayload = {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
      };
  
      console.log('🔐 Gửi yêu cầu đăng nhập:', loginPayload);
  
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
        signal: AbortSignal.timeout(5000),
      });
  
      console.log('📥 Response Status:', response.status);
  
      let errorMessage = 'Thông tin đăng nhập không chính xác';
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
  
        if (!response.ok) {
          errorMessage = data.message || errorMessage;
          setApiError(errorMessage); // ❌ KHÔNG throw nữa
          return;
        }
  
        // Đăng nhập thành công
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
          email: data.email,
          fullName: data.fullName,
          role: data.role,
        }));
  
        router.push('/dashboard');
  
      } else {
        // Nếu trả về text thuần (ví dụ: "Sai mật khẩu")
        const text = await response.text();
        if (!response.ok) {
          errorMessage = text || errorMessage;
          setApiError(errorMessage);
          return;
        }
      }
  
    } catch (err) {
      console.error('❌ Lỗi:', err);
      setApiError(err.message || 'Đăng nhập thất bại, vui lòng thử lại');
  
      if (
        err.message.includes('kết nối') ||
        err.message.includes('không nhận được phản hồi') ||
        err.message.includes('Failed to fetch')
      ) {
        setApiError(prev => prev + ' Hãy kiểm tra kết nối hoặc thử lại sau.');
      }
  
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const loadFacebookSDK = () => {
      if (!isClient) return; // Chỉ chạy ở phía client
      
      if (document.getElementById('facebook-jssdk')) return;
      
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = "https://connect.facebook.net/vi_VN/sdk.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadFacebookSDK();
  }, [isClient]); // Thêm isClient vào dependency array

  const handleFacebookLogin = async (response) => {
    if (!isClient) return; // Chỉ chạy ở phía client
    
    try {
      setFacebookLoading(true);
      console.log('Facebook Response:', response);
      
      // Kiểm tra authResponse
      if (!response.authResponse) {
        throw new Error('Không nhận được token từ Facebook');
      }
      
      // Lấy thông tin người dùng từ Facebook
      const userInfo = await new Promise((resolve, reject) => {
        window.FB.api('/me', { fields: 'id,name,email,picture' }, (userData) => {
          if (userData.error) {
            reject(userData.error);
          } else {
            resolve(userData);
          }
        });
      });
      
      console.log('User Info from FB:', userInfo);
      
      // Gửi cả token và thông tin người dùng
      const result = await fetch('http://localhost:8080/api/auth/facebook-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: response.authResponse.accessToken,
          userId: response.authResponse.userID,
          email: userInfo.email,
          name: userInfo.name
        })
      });

      if (!result.ok) {
        throw new Error(`Lỗi server: ${result.status}`);
      }

      const data = await result.json();
      console.log('Login success:', data);

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        profilePicture: data.profilePicture
      }));

      router.push('/dashboard');
    } catch (error) {
      console.error('Facebook Login Error:', error);
      setApiError('Đăng nhập Facebook thất bại: ' + error.message);
    } finally {
      setFacebookLoading(false);
    }
  };

  const initiateFacebookLogin = () => {
    if (!isClient) return; // Chỉ chạy ở phía client
    
    if (!window.FB) {
      setApiError('Facebook SDK không khả dụng, vui lòng thử lại sau.');
      return;
    }

    window.FB.login(function(response) {
      console.log('FB.login response:', response);
      
      if (response.status === 'connected') {
        handleFacebookLogin(response);
      } else {
        setApiError('Đăng nhập Facebook bị hủy bởi người dùng');
      }
    }, {scope: 'email,public_profile'});
  };

  if (apiError) {
    console.error('API Error:', apiError);
  }

  return (
    <GoogleOAuthProvider 
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
    >
      <div style={{ display: 'none' }}>
        <GoogleLogin 
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
      <AppTheme {...props}>
        <Head>
          <title>Đăng nhập</title>
        </Head>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">
          <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
          <Card variant="outlined">
            <FilterVintageIcon 
              sx={{ 
                fontSize: 40,
                color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                animation: 'spin 10s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
              Đăng nhập
            </Typography>
            
            {apiError && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {apiError}
              </Alert>
            )}
            
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="emailOrPhone">Email hoặc Số điện thoại</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="emailOrPhone"
                  name="emailOrPhone"
                  placeholder="Email hoặc số điện thoại"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? 'error' : 'primary'}
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? 'error' : 'primary'}
                  value={formData.password}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Ghi nhớ đăng nhập"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>
              <Button 
                onClick={handleOpenForgotPassword} 
                variant="text" 
                color="primary"
              >
                Quên mật khẩu?
              </Button>
            </Box>
            <Divider>hoặc</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Ẩn GoogleLogin */}
              <div style={{ display: 'none' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>
              
              {/* Nút hiển thị thay thế */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => {
                  const googleLoginButton = document.querySelector('[role="button"]');
                  if (googleLoginButton) {
                    googleLoginButton.click();
                  }
                }}
                disabled={googleLoading}
              >
                {googleLoading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={initiateFacebookLogin}
                startIcon={<FacebookIcon />}
                disabled={facebookLoading}
                sx={{
                  borderColor: '#1877f2',
                  color: '#1877f2',
                  '&:hover': {
                    borderColor: '#0d5aa7',
                    backgroundColor: 'rgba(24, 119, 242, 0.04)'
                  }
                }}
              >
                {facebookLoading ? 'Đang xử lý...' : 'Đăng nhập với Facebook'}
              </Button>
              <Typography component="p" variant="caption" sx={{ mt: 2, textAlign: 'center' }}>
                Chưa có tài khoản? <Link href="/sign-up" color="primary">Đăng ký</Link>
              </Typography>
            </Box>
          </Card>
        </SignInContainer>

        {/* Dialog Quên mật khẩu */}
        <Dialog 
          open={openForgotPassword} 
          onClose={handleCloseForgotPassword}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              background: theme => theme.palette.mode === 'dark' 
                ? 'linear-gradient(to bottom right, #1a237e, #121212)'
                : 'linear-gradient(to bottom right, #e3f2fd, #ffffff)',
              borderRadius: '16px',
              boxShadow: theme => theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'transparent',
              pb: 1
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockResetIcon 
                sx={{ 
                  color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                  fontSize: 28 
                }} 
              />
              <Typography 
                variant="h6"
                sx={{
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
                  fontWeight: 600
                }}
              >
                Đặt lại mật khẩu
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseForgotPassword}
                sx={{ 
                  marginLeft: 'auto',
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : '#666',
                  '&:hover': {
                    backgroundColor: theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent
            sx={{
              background: 'transparent',
              pt: 2,
              '& .MuiTextField-root': {
                '& .MuiInputLabel-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                  transform: 'translate(14px, 10px)',
                },
                '& .MuiInputLabel-shrink': {
                  transform: 'translate(14px, -15px) scale(0.75)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                },
              }
            }}
          >
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                py: 3,
                '& .MuiStepLabel-label': {
                  color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit'
                },
                '& .MuiStepIcon-root': {
                  color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {forgotPasswordError && (
              <Alert severity="error" sx={{ mb: 2 }}>{forgotPasswordError}</Alert>
            )}
            {forgotPasswordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>{forgotPasswordSuccess}</Alert>
            )}

            <form ref={forgotPasswordFormRef} onSubmit={handleForgotPasswordSubmit}>
              {activeStep === 0 && (
                <TextField
                  fullWidth
                  label="Email"
                  name="emailInput"
                  type="email"
                  value={forgotPasswordData.emailInput}
                  onChange={handleForgotPasswordChange}
                  required
                  sx={{ 
                    mt: 2,
                    '& .MuiInputLabel-root': {
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                    },
                    '& .MuiInputLabel-shrink': {
                      transform: 'translate(14px, -10px)',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)',
                      },
                      '&:hover fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                    },
                  }}
                  variant="outlined"
                />
              )}

              {activeStep === 1 && (
                <TextField
                  fullWidth
                  label="Mã xác nhận"
                  name="verificationCode"
                  value={forgotPasswordData.verificationCode}
                  onChange={handleForgotPasswordChange}
                  required
                  sx={{ 
                    mt: 2,
                    '& .MuiInputLabel-root': {
                      color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                    },
                    '& .MuiInputLabel-shrink': {
                      transform: 'translate(14px, -10px)',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)',
                      },
                      '&:hover fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                    },
                  }}
                  variant="outlined"
                />
              )}

              {activeStep === 2 && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type="password"
                    value={forgotPasswordData.newPassword}
                    onChange={handleForgotPasswordChange}
                    required
                    sx={{ 
                      mt: 2,
                      '& .MuiInputLabel-root': {
                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -10px)',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                      },
                    }}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    type="password"
                    value={forgotPasswordData.confirmPassword}
                    onChange={handleForgotPasswordChange}
                    required
                    sx={{ 
                      transform: 'translate(0px, 10px)',
                      mt: 2,
                      '& .MuiInputLabel-root': {
                        color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -10px)',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.5)' : 'rgba(25, 118, 210, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: theme => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                      },
                    }}
                    variant="outlined"
                  />
                </Stack>
              )}
            </form>
          </DialogContent>

          <DialogActions 
            sx={{ 
              px: 3, 
              pb: 3,
              background: 'transparent',
              '& .MuiButton-root': {
                borderRadius: '8px',
                textTransform: 'none',
                px: 3
              }
            }}
          >
            {activeStep > 0 && (
              <Button 
                onClick={handleBack}
                sx={{
                  color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'
                }}
              >
                Quay lại
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleForgotPasswordSubmit}
              disabled={forgotPasswordLoading}
              sx={{
                background: theme => theme.palette.mode === 'dark' 
                  ? 'linear-gradient(45deg, #1976d2, #90caf9)'
                  : 'linear-gradient(45deg, #1976d2, #42a5f5)',
                '&:hover': {
                  background: theme => theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #1565c0, #64b5f6)'
                    : 'linear-gradient(45deg, #1565c0, #1976d2)'
                }
              }}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Đặt lại mật khẩu'
              ) : (
                'Tiếp tục'
              )}
            </Button>
          </DialogActions>
        </Dialog>

      </AppTheme>
    </GoogleOAuthProvider>

  );
}
