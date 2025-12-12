/**
 * Utility para combinar classNames condicionalmente
 * Similar a clsx/classnames pero más simple
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...classes: ClassValue[]): string {
  return classes
    .flat()
    .filter((x) => typeof x === 'string')
    .join(' ')
    .trim();
}
