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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

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
  const [verificationSent, setVerificationSent] = React.useState(false);

  const [openVerifyDialog, setOpenVerifyDialog] = React.useState(false);
  const [verifyData, setVerifyData] = React.useState({
    email: '',
    code: ''
  });
  const [verifyError, setVerifyError] = React.useState('');
  const [verifySuccess, setVerifySuccess] = React.useState('');
  const [verifyLoading, setVerifyLoading] = React.useState(false);

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
    setVerificationSent(false);
  
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
  
    console.log('🔐 Gửi yêu cầu đăng ký:', requestData);
  
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Xử lý phản hồi thành công
      if (isEmailInput) {
        setVerificationSent(true);
        setApiSuccess('Đăng ký thành công! Vui lòng xác thực tài khoản qua email trước khi đăng nhập.');
        // Chuyển hướng đến trang xác thực email
        router.push(`/verify-email?email=${encodeURIComponent(formData.emailOrPhone)}`);
      } else {
        setApiSuccess('Đăng ký thành công!');
        setTimeout(() => {
          setApiSuccess(prev => prev + ' Chuyển hướng đến trang đăng nhập...');
          setTimeout(() => router.push('/sign-in'), 1000);
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Lỗi:', err);
      if (err.message === 'Failed to fetch') {
        setApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } else {
        setApiError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyData.code) {
      setVerifyError('Vui lòng nhập mã xác thực');
      return;
    }
    
    setVerifyLoading(true);
    setVerifyError('');
    setVerifySuccess('');
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verifyData.email,
          code: verifyData.code
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Mã xác thực không hợp lệ');
      }
      
      setVerifySuccess('Xác thực email thành công! Bạn có thể đăng nhập.');
      setTimeout(() => {
        setOpenVerifyDialog(false);
        setVerifyData({ email: '', code: '' });
        router.push('/sign-in');
      }, 2000);
    } catch (err) {
      setVerifyError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setVerifyLoading(false);
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

          {/* Hiển thị thông báo xác thực email */}
          {verificationSent && (
            <Alert 
              severity="info" 
              sx={{ width: '100%' }}
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => {
                    setVerifyData({ ...verifyData, email: formData.emailOrPhone });
                    setOpenVerifyDialog(true);
                  }}
                >
                  XÁC THỰC NGAY
                </Button>
              }
            >
              Vui lòng xác thực tài khoản qua email trước khi đăng nhập. Kiểm tra hộp thư của bạn.
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

      {/* Dialog Xác thực Email */}
      <Dialog
        open={openVerifyDialog}
        onClose={() => setOpenVerifyDialog(false)}
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
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Xác thực Email
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOpenVerifyDialog(false)}
              sx={{ marginLeft: 'auto' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {verifyError && (
            <Alert severity="error" sx={{ mb: 2 }}>{verifyError}</Alert>
          )}
          {verifySuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>{verifySuccess}</Alert>
          )}

          <form onSubmit={handleVerifySubmit}>
            <TextField
              fullWidth
              label="Mã xác thực"
              value={verifyData.code}
              onChange={(e) => setVerifyData({ ...verifyData, code: e.target.value })}
              required
              sx={{ mt: 2 }}
            />
          </form>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenVerifyDialog(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifySubmit}
            disabled={verifyLoading}
          >
            {verifyLoading ? 'Đang xử lý...' : 'Xác thực'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
}
