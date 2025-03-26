import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { GoogleIcon, FacebookIcon } from '../sign-in/components/CustomIcons';
import FilterVintageIcon from '@mui/icons-material/FilterVintage';
import '../../styles/fixSuccess.module.css';

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

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

export default function SignUp(props) {

  
  
  const router = useRouter();
  const theme = useTheme();
  
  // State quản lý form
  const [formData, setFormData] = React.useState({
    fullName: '',
    emailOrPhone: '', // Một trường duy nhất cho email/phone
    password: '',
    confirmPassword: '', // Thêm trường xác nhận mật khẩu
  });
  
  // State quản lý lỗi
  const [errors, setErrors] = React.useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '', // Thêm lỗi cho trường xác nhận mật khẩu
  });
  
  // State quản lý lỗi từ API
  const [apiError, setApiError] = React.useState('');
  const [apiSuccess, setApiSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Kiểm tra nếu là email
  const isEmail = (value) => {
    return /\S+@\S+\.\S+/.test(value);
  };
  
  // Kiểm tra nếu là số điện thoại
  const isPhone = (value) => {
    return /^(0|\+84)[0-9]{9,10}$/.test(value.replace(/\s/g, ''));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // Validate email/phone
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Vui lòng nhập email hoặc số điện thoại';
      isValid = false;
    } else if (!isEmail(formData.emailOrPhone) && !isPhone(formData.emailOrPhone)) {
      newErrors.emailOrPhone = 'Email hoặc số điện thoại không hợp lệ';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    // Validate confirmPassword
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Reset thông báo
    setApiError('');
    setApiSuccess('');
  
    // Kiểm tra hợp lệ
    if (!validateForm()) return;
  
    setLoading(true);
  
    const isEmailInput = isEmail(formData.emailOrPhone);
  
    const requestData = {
      fullName: formData.fullName || 'Người dùng',
      email: isEmailInput ? formData.emailOrPhone : `user_${Date.now()}@placeholder.com`,
      phone: isEmailInput ? null : formData.emailOrPhone,
      password: formData.password,
    };
  
    console.log('🚀 Sending Request:', requestData);
  
    try {
      let serverOffline = false;
  
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(5000),
      }).catch((err) => {
        console.error('Network Error:', err);
        serverOffline = true;
  
        if (err.name === 'AbortError') {
          setApiError('Không nhận được phản hồi từ máy chủ, yêu cầu đã bị hủy sau thời gian chờ.');
        } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          setApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra xem máy chủ đã khởi động chưa.');
        } else {
          setApiError('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
        }
      });
  
      if (serverOffline || !response) return;
  
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Đăng ký thất bại';
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          errorMessage = data.message || errorMessage;
          setApiError(errorMessage); // ✅ Không throw nữa
          return;
        }
      } else {
        const text = await response.text();
        if (!response.ok) {
          errorMessage = text || errorMessage;
          setApiError(errorMessage); // ✅ Không throw nữa
          return;
        }
      }
  
      // Thành công
      setApiSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
      setTimeout(() => router.push('/sign-in'), 2000);
  
    } catch (err) {
      console.error('Lỗi không xác định:', err);
      setApiError('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  
      if (
        err.message.includes('kết nối') ||
        err.message.includes('không nhận được phản hồi') ||
        err.message.includes('Failed to fetch')
      ) {
        setApiError(prev => prev + ' Bạn có thể dùng ứng dụng ở chế độ ngoại tuyến.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
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
            Đăng ký
          </Typography>
          
          {/* Hiển thị lỗi từ API */}
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ width: '100%' }}
              action={
                apiError.includes('kết nối') || apiError.includes('không nhận được phản hồi') ? (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => router.push('/offline-mode')}
                  >
                    DÙNG NGOẠI TUYẾN
                  </Button>
                ) : null
              }
            >
              {apiError}
            </Alert>
          )}
          
          {/* Hiển thị thành công */}
          {apiSuccess && (
            <Alert severity="success" sx={{ width: '100%' }}>
              {apiSuccess}
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="fullName">Họ tên (tùy chọn)</FormLabel>
                  <TextField
                    id="fullName"
                    name="fullName"
                    fullWidth
                    variant="outlined"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="emailOrPhone">Email hoặc số điện thoại</FormLabel>
                  <TextField
                    id="emailOrPhone"
                    name="emailOrPhone"
                    fullWidth
                    variant="outlined"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    error={!!errors.emailOrPhone}
                    helperText={errors.emailOrPhone}
                    placeholder="Nhập email hoặc số điện thoại"
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="password">Mật khẩu</FormLabel>
                  <TextField
                    id="password"
                    name="password"
                    type="password"
                    required
                    fullWidth
                    variant="outlined"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FormLabel>
                  <TextField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    fullWidth
                    variant="outlined"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                  />
                </FormControl>
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </Box>
          
          <Divider>hoặc</Divider>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Đăng ký với Google')}
              startIcon={<GoogleIcon />}
            >
              Đăng ký với Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Đăng ký với Facebook')}
              startIcon={<FacebookIcon />}
            >
              Đăng ký với Facebook
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Đã có tài khoản?{' '}
              <Link
                href="/sign-in"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Đăng nhập
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
