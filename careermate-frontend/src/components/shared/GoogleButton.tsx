'use client';

import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/ui/button';

interface GoogleButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  text?: string;
  className?: string;
}

export default function GoogleButton({
  onClick,
  isLoading = false,
  text = 'Continue with Google',
  className,
}: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      isLoading={isLoading}
      className={className}
      leftIcon={<FcGoogle className="w-5 h-5" />}
    >
      {text}
    </Button>
  );
}
