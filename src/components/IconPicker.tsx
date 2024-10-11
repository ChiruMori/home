import { IconName, IconPrefix, fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Select, Space } from 'antd';

interface IconProps {
  name: string;
  value: [IconPrefix, IconName];
}
// 全部可用图标
const icons = [] as IconProps[];
Object.entries(fas).forEach(([key, value]) => {
  icons.push({
    value: [value.prefix, value.iconName],
    name: key,
  });
});
Object.entries(fab).forEach(([key, value]) => {
  icons.push({
    value: [value.prefix, value.iconName],
    name: key,
  });
});
Object.entries(far).forEach(([key, value]) => {
  icons.push({
    value: [value.prefix, value.iconName],
    name: key,
  });
});

// 支持 key 搜索的图标选择器
const IconPicker: React.FC<{
  onSelect: (val: [IconPrefix, IconName]) => void;
  value?: [IconPrefix, IconName];
}> = ({ value, onSelect }) => {
  const [search, setSearch] = React.useState('');
  const [icon, setIcon] = React.useState(value);
  const filteredIcons =
    search === ''
      ? icons
      : icons.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        );
  return (
    <Select
      showSearch
      value={icon}
      placeholder="未选择图标"
      onChange={(value) => {
        setIcon(value as [IconPrefix, IconName]);
        onSelect(value as [IconPrefix, IconName]);
      }}
      onSearch={(value) => setSearch(value)}
    >
      {filteredIcons.map((item) => (
        <Select.Option key={item.name} value={item.value}>
          <Space>
            <FontAwesomeIcon icon={item.value} />
            <span>{item.name}</span>
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
};

export default IconPicker;
