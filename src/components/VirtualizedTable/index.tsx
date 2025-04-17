
import React, { useState } from 'react';
import { Table, Input, Popover, Modal, Badge, Typography } from 'antd';
import { MoreOutlined, MessageOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateCellValue } from '../../store/tableSlice';
import { tableColumns } from '../../utils/dataGenerator';
import './styles.css';

const { Text } = Typography;

const VirtualizedTable: React.FC = () => {
  const dispatch = useDispatch();
  const { data, overriddenValues } = useSelector((state: RootState) => ({
    data: state.table.data,
    overriddenValues: state.table.overriddenValues
  }));

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Configure editable cell
  const EditableCell: React.FC<{
    value: number;
    record: any;
    dataIndex: string;
  }> = ({ value, record, dataIndex }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    
    const handleSave = () => {
      dispatch(updateCellValue({
        rowKey: record.key,
        dataIndex,
        value: Number(inputValue)
      }));
      setEditing(false);
    };

    // Check if this cell has an override indicator
    const hasOverride = record.children && 
      record.children.length > 0 && 
      overriddenValues[record.key]?.[dataIndex];

    if (editing) {
      return (
        <div className="editable-cell">
          <Input 
            value={inputValue}
            onChange={e => setInputValue(Number(e.target.value))}
            onPressEnter={handleSave}
            onBlur={handleSave}
            autoFocus
            className="editable-input"
          />
        </div>
      );
    }

    return (
      <div 
        className="editable-cell" 
        onClick={() => !record.isTotal && setEditing(true)}
        style={{ cursor: record.isTotal ? 'default' : 'pointer' }}
      >
        <span className="editable-cell-value-wrap">
          {value}
          {hasOverride && (
            <span 
              className="override-indicator"
              style={{ backgroundColor: '#F97316' }}
            />
          )}
        </span>
      </div>
    );
  };

  // Configure action column
  const renderActionColumn = (_: any, record: any) => {
    if (record.isTotal) return null;
    
    return (
      <div className="actions-container">
        <div className="action-buttons">
          <MessageOutlined
            className="message-icon"
            onClick={() => {
              setSelectedRow(record);
              setModalVisible(true);
            }}
          />
          <Popover
            content={
              <div className="action-menu">
                <div className="action-item">Edit</div>
                <div className="action-item">Duplicate</div>
                <div className="action-item">Delete</div>
              </div>
            }
            trigger="click"
            placement="bottomRight"
          >
            <MoreOutlined className="more-icon" />
          </Popover>
        </div>
      </div>
    );
  };

  // Create columns configuration
  const columns = tableColumns.map(col => {
    if (col.dataIndex === 'actions') {
      return {
        ...col,
        render: renderActionColumn
      };
    }
    
    if (col.editable) {
      return {
        ...col,
        render: (value: any, record: any) => (
          <EditableCell 
            value={value} 
            record={record} 
            dataIndex={col.dataIndex} 
          />
        )
      };
    }
    
    return col;
  });

  // Handle row expansion
  const onExpand = (expanded: boolean, record: any) => {
    if (expanded) {
      setExpandedKeys([...expandedKeys, record.key]);
    } else {
      setExpandedKeys(expandedKeys.filter(k => k !== record.key));
    }
  };

  return (
    <div className="virtualized-table-container">
      <Table
        columns={columns}
        dataSource={data}
        rowClassName={(record) => 
          expandedKeys.includes(record.key) ? 'row-expanded' : ''
        }
        expandable={{
          onExpand,
          expandedRowKeys: expandedKeys,
          rowExpandable: record => record.children && record.children.length > 0
        }}
        bordered
        scroll={{ x: 'max-content', y: 500 }}
        pagination={false}
        size="middle"
        virtual // Using Ant Design's built-in virtualization
      />
      
      <Modal
        title={`Comments for ${selectedRow?.campaign || ''}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <p>Add your comments for this campaign here.</p>
      </Modal>
    </div>
  );
};

export default VirtualizedTable;
