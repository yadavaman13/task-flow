import { useState, useEffect } from 'react';
import Modal from '@/components/Shared/Modals/Modal/Modal';
import Button from '@/components/Shared/Buttons/Button/Button';
import Input from '@/components/Shared/Form/Input/Input';
import { useAuth } from '../../hooks/useAuth';
import './OtpVerification.scss';

export default function OtpVerification({
  isOpen,
  onClose,
  email,
  onSuccess,
}) {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const { handleVerifyOtp, handleSendOtp, isSubmitting } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setTimeLeft(600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatMinutes = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;

    const result = await handleVerifyOtp({ email, otp: otp.trim() });
    if (result.success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleResend = async () => {
    const res = await handleSendOtp(email);
    if (res.success) {
      setTimeLeft(600);
      setOtp('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Email" size="sm">
      <form onSubmit={handleSubmit} className="otp-verification">
        <p className="otp-verification__intro">
          We sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below.
        </p>

        <Input
          label="Verification Code"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
          autoFocus
        />

        <div className="otp-verification__timer">
          {timeLeft > 0 ? (
            <span>Code expires in: <strong>{formatMinutes(timeLeft)}</strong></span>
          ) : (
            <span className="otp-verification__expired">Code has expired</span>
          )}
        </div>

        <div className="otp-verification__actions">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={timeLeft > 540 || isSubmitting}
          >
            Resend Code
          </Button>

          <Button type="submit" variant="primary" loading={isSubmitting} disabled={!otp || isSubmitting}>
            Verify
          </Button>
        </div>
      </form>
    </Modal>
  );
}
