import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

const strToIcon = (str: string): [IconPrefix, IconName] => {
  if ('' === str) {
    return ['fas', 'question'];
  }
  const [prefix, name] = str.split(' ');
  return [prefix as IconPrefix, name as IconName];
};

export default {
  strToIcon,
};
