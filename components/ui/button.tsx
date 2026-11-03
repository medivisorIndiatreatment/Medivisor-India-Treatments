import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/components/design-tokens';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E22026] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#E22026] text-white hover:bg-[#c01b21] hover:shadow-md active:scale-[0.98] cursor-pointer',
        primary: 'bg-[#23366E] text-white hover:bg-[#1A2A52]  hover:shadow-md text-sm active:scale-[0.98] cursor-pointer',
        secondary: 'bg-[#29A9B9] text-white hover:bg-[#1F8A96] hover:shadow-md text-sm active:scale-[0.98] cursor-pointer',
        destructive: `${DESIGN_TOKENS.BACKGROUNDS.ACCENT_RED} text-white hover:bg-[#c01b21]`,
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        link: 'text-[#E22026] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-lg',
        xl: 'h-12 px-10 rounded-lg text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<any, any>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
