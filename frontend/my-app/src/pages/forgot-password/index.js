import * as React from 'react';
import Head from 'next/head';
import AppTheme from '../shared-theme/AppTheme';
import { useRouter } from 'next/router';
import { Box, IconButton, Button, TextField, Alert, Typography, Paper, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockResetIcon from '@mui/icons-material/LockReset';
import '../../styles/forgotpassword.css';

const steps = ['Nhập email', 'Nhập mã xác nhận', 'Đặt lại mật khẩu'];
const API_URL = 'http://localhost:8080/api/auth';

export default function ForgotPasswordPage(props) {
  const router = useRouter();
  const formRef = React.useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = React.useState({
    emailInput: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSendVerificationCode = async () => {
    console.log("🟢 handleSendVerificationCode is running...");

    if (!formData.emailInput) {
        console.error("❌ Lỗi: Chưa nhập email");
        setError("Vui lòng nhập địa chỉ email");
        return;
    }

    console.log("🔹 Email đang gửi:", formData.emailInput);
    console.log("🔹 Gửi request đến API:", `${API_URL}/forgot-password`);

    // Log payload
    const payload = { email: formData.emailInput };
    console.log("🔹 Request payload:", JSON.stringify(payload));

    setLoading(true);
    try {
        // Thử ping API trước
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
        console.log("📢 API Response Headers:", [...response.headers.entries()]);

        const data = await response.json();
        console.log("📢 API Response Data:", data);

        if (!response.ok) throw new Error(data.message || "Lỗi gửi mã xác nhận");

        setSuccess("Mã xác nhận đã được gửi đến email của bạn");
        setActiveStep(1);
    } catch (err) {
        console.error("🚨 Lỗi gửi mã xác nhận:", err);
        setError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      setError('Vui lòng nhập mã xác nhận');
      return;
    }
    if (formData.verificationCode.length !== 6) {
      setError('Mã xác nhận phải có 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Verifying code:', {
        email: formData.emailInput,
        code: formData.verificationCode
      });

      const response = await fetch(`${API_URL}/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.emailInput,
          code: formData.verificationCode,
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Mã xác nhận không hợp lệ');
      }

      setSuccess('Mã xác nhận hợp lệ');
      setActiveStep(2);
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Resetting password:', {
        email: formData.emailInput,
        code: formData.verificationCode,
        newPassword: formData.newPassword
      });

      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.emailInput,
          code: formData.verificationCode,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể đặt lại mật khẩu');
      }

      setSuccess('Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.');
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    console.log("✅ Form submitted at step:", activeStep);
    console.log("✅ Form data at submit:", formData);

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
    setError('');
    setSuccess('');
  };

  return (
    <AppTheme {...props}>
      <Head>
        <title>Quên mật khẩu</title>
        <link rel="stylesheet" href="/styles/forgotpassword.css" />
      </Head>

      <Box className="forgot-password-container">
        <IconButton
          onClick={() => router.push('/sign-in')}
          aria-label="Quay lại trang đăng nhập"
          className="back-button"
        >
          <ArrowBackIcon />
        </IconButton>

        <Paper className="form-paper">
          <Box className="form-header">
            <LockResetIcon className="icon-pulse" />
            <Typography variant="h4" component="h1" className="gradient-text">
              Khôi phục mật khẩu
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} className="stepper">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" variant="filled" className="alert error">{error}</Alert>}
          {success && <Alert severity="success" variant="filled" className="alert success">{success}</Alert>}

          <form ref={formRef} onSubmit={handleSubmit} noValidate className="form-container">
            <Box className="form-fields">
              {activeStep === 0 && (
                <>
                  <Typography variant="body1" color="text.secondary" className="form-description">
                    Nhập địa chỉ email của tài khoản và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
                  </Typography>
                  <TextField
                    autoFocus
                    required
                    id="emailInput"
                    name="emailInput"
                    label="Địa chỉ email"
                    placeholder="Nhập email của bạn"
                    type="email"
                    fullWidth
                    value={formData.emailInput}
                    onChange={handleChange}
                    disabled={loading}
                    className="input-field"
                  />
                </>
              )}
              
              {activeStep === 1 && (
                <>
                  <Typography variant="body1" color="text.secondary" className="form-description">
                    Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra và nhập mã xác nhận.
                  </Typography>
                  <TextField
                    autoFocus
                    required
                    id="verificationCode"
                    name="verificationCode"
                    label="Mã xác nhận"
                    placeholder="Nhập mã xác nhận"
                    fullWidth
                    value={formData.verificationCode}
                    onChange={handleChange}
                    disabled={loading}
                    className="input-field verification-code"
                    inputProps={{
                      maxLength: 6,
                    }}
                  />
                  <Button 
                    size="small"
                    onClick={handleSendVerificationCode}
                    disabled={loading}
                    className="resend-button"
                  >
                    Gửi lại mã
                  </Button>
                </>
              )}
              
              {activeStep === 2 && (
                <>
                  <Typography variant="body1" color="text.secondary" className="form-description">
                    Tạo mật khẩu mới cho tài khoản của bạn.
                  </Typography>
                  <TextField
                    autoFocus
                    required
                    id="newPassword"
                    name="newPassword"
                    label="Mật khẩu mới"
                    placeholder="Nhập mật khẩu mới"
                    type="password"
                    fullWidth
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="input-field"
                  />
                  <TextField
                    required
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    placeholder="Nhập lại mật khẩu mới"
                    type="password"
                    fullWidth
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="input-field"
                  />
                </>
              )}
            </Box>

            {loading && (
              <Box className="loading-overlay">
                <CircularProgress className="loading-spinner" />
                <Typography variant="body2">
                  Đang xử lý...
                </Typography>
              </Box>
            )}

            <Box className="button-group">
              <Button 
                onClick={() => router.push('/sign-in')} 
                disabled={loading}
                variant="outlined"
                className="cancel-button"
              >
                Hủy
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep > 0 && (
                  <Button 
                    onClick={handleBack} 
                    disabled={loading}
                    className="back-button"
                  >
                    Quay lại
                  </Button>
                )}
                
                <Button 
                  variant="contained" 
                  type="submit" 
                  disabled={loading}
                  className="submit-button"
                >
                  {loading 
                    ? <Box className="loading-button">
                        <CircularProgress size={16} />
                        <span>Đang xử lý...</span>
                      </Box>
                    : activeStep === steps.length - 1 
                      ? 'Hoàn thành' 
                      : 'Tiếp tục'
                  }
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </AppTheme>
  );
}
