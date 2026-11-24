import Link from 'next/link';
import clsx from 'clsx';
import styles from './Button.module.css';

type Common = { variant?: 'primary' | 'ghost' | 'light'; small?: boolean; children: React.ReactNode; className?: string };
type AsButton = Common & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined };
type AsLink = Common & { href: string };

export function Button(props: AsButton | AsLink) {
  const { variant = 'primary', small, className, children } = props;
  const cls = clsx(styles.btn, variant === 'ghost' && styles.ghost, variant === 'light' && styles.light, small && styles.small, className);
  if (props.href !== undefined) return <Link href={props.href} className={cls}>{children}</Link>;
  const { variant: _v, small: _s, className: _c, children: _ch, href: _h, ...rest } = props;
  void _v; void _s; void _c; void _ch; void _h;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}
