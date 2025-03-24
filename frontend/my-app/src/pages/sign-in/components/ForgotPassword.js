import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

console.log('ForgotPassword component loaded');

const steps = ['Nhập email', 'Nhập mã xác nhận', 'Đặt lại mật khẩu'];

const API_URL = 'http://localhost:8080/api/auth';

function ForgotPassword({ open, handleClose }) {
  console.log('ForgotPassword props:', { open, handleClose });
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

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      emailInput: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleCloseDialog = () => {
    handleReset();
    handleClose();
  };

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
        handleCloseDialog();
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
        handleSendVerificationCode(); // Gọi đúng hàm
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
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      aria-labelledby="forgot-password-dialog-title"
      keepMounted
      disableEnforceFocus
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <DialogTitle id="forgot-password-dialog-title">
          Khôi phục mật khẩu
          <IconButton
            aria-label="Đóng"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', minHeight: '300px', pt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ my: 2 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" role="alert">
              {success}
            </Alert>
          )}

          {activeStep === 0 && (
            <>
              <DialogContentText id="email-description">
                Nhập địa chỉ email của tài khoản và chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
              </DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                id="emailInput"
                name="emailInput"
                label="Địa chỉ email"
                placeholder="Nhập email của bạn"
                type="email"
                fullWidth
                value={formData.emailInput}
                onChange={handleChange}
                disabled={loading}
                aria-describedby="email-description"
                inputProps={{
                  'aria-label': 'Địa chỉ email',
                }}
              />
            </>
          )}

          {activeStep === 1 && (
            <>
              <DialogContentText id="verification-code-description">
                Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra và nhập mã xác nhận.
              </DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                id="verificationCode"
                name="verificationCode"
                label="Mã xác nhận"
                placeholder="Nhập mã xác nhận"
                fullWidth
                value={formData.verificationCode}
                onChange={handleChange}
                disabled={loading}
                aria-describedby="verification-code-description"
                inputProps={{
                  'aria-label': 'Mã xác nhận',
                  maxLength: 6,
                }}
              />
            </>
          )}

          {activeStep === 2 && (
            <>
              <DialogContentText id="new-password-description">
                Tạo mật khẩu mới cho tài khoản của bạn.
              </DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                id="newPassword"
                name="newPassword"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                type="password"
                fullWidth
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
                aria-describedby="new-password-description"
                inputProps={{
                  'aria-label': 'Mật khẩu mới',
                  minLength: 6,
                }}
              />
              <TextField
                required
                margin="dense"
                id="confirmPassword"
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                type="password"
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                inputProps={{
                  'aria-label': 'Xác nhận mật khẩu',
                  minLength: 6,
                }}
              />
            </>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} role="status" aria-label="Đang xử lý">
              <CircularProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={handleCloseDialog} disabled={loading} type="button">
            Hủy
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading} type="button">
              Quay lại
            </Button>
          )}
          <Button 
            variant="contained"
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Đang xử lý...' : activeStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
