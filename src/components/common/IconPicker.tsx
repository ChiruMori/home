import {
  IconDefinition,
  IconName,
  IconPrefix,
  fas,
} from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { forwardRef } from 'react';
import { Select, Space } from 'antd';

interface IconProps {
  name: string;
  value: [IconPrefix, IconName];
}
// 全部可用图标
const allIcons = [] as IconProps[];
const iconHandler = ([_, value]: [string, IconDefinition]) => {
  allIcons.push({
    value: [value.prefix, value.iconName],
    name: value.prefix + ' ' + value.iconName,
  });
};
Object.entries(fas).forEach(iconHandler);
Object.entries(fab).forEach(iconHandler);
Object.entries(far).forEach(iconHandler);
allIcons.sort((a, b) => a.name.localeCompare(b.name));
// 有序列表去重
const icons = allIcons.filter(
  (item, index, arr) => arr.findIndex((i) => i.name === item.name) === index,
);

// 支持 key 搜索的图标选择器
const IconPicker = forwardRef<any, React.ComponentProps<typeof Select>>(
  ({ onChange, value, ...rest }, ref) => {
    const [search, setSearch] = React.useState('');

    const filteredIcons =
      search === ''
        ? icons
        : icons.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase()),
          );

    return (
      <Select
        value={value}
        onSearch={setSearch}
        onChange={onChange}
        ref={ref}
        {...rest}
      >
        {filteredIcons.map((item) => (
          <Select.Option key={item.name} value={item.name}>
            <Space>
              <FontAwesomeIcon icon={item.value} />
              <span>{item.name}</span>
            </Space>
          </Select.Option>
        ))}
      </Select>
    );
  },
);

export default IconPicker;
