
import React, { useState, useEffect } from 'react';
import { Table, Input, Popover, Modal, Badge, Typography, Select } from 'antd';
import { MoreOutlined, MessageOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateCellValue } from '../../store/tableSlice';
import './styles.css';

const { Text } = Typography;
const { Option } = Select;

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
    value: any;
    record: any;
    dataIndex: string;
    level?: number;
  }> = ({ value, record, dataIndex, level = 0 }) => {
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

    // If this is the total row or a value like € that shouldn't be editable
    const isEditable = !record.isTotal && typeof value === 'number';
    
    if (editing) {
      return (
        <div className="editable-cell">
          <Input 
            value={inputValue}
            onChange={e => {
              const val = e.target.value;
              if (!isNaN(Number(val)) || val === '') {
                setInputValue(val === '' ? 0 : Number(val));
              }
            }}
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
        onClick={() => isEditable && setEditing(true)}
        style={{ cursor: isEditable ? 'pointer' : 'default' }}
      >
        <span className="editable-cell-value-wrap">
          {typeof value === 'number' ? value : value}
          {hasOverride && <span className="override-indicator" />}
        </span>
      </div>
    );
  };

  // Configure campaign column
  const renderCampaignColumn = (text: string, record: any, level = 0) => {
    if (record.isTotal) {
      return <Text strong>{text}</Text>;
    }
    
    const campaignIndent = level * 24;

    // Level 0 row shows the badge with code
    if (level === 0 && record.shortCode) {
      return (
        <div className="campaign-badge" style={{ paddingLeft: campaignIndent }}>
          <div 
            className="campaign-code" 
            style={{ backgroundColor: record.color || '#8E9196' }}
          >
            {record.shortCode}
          </div>
          <div className="campaign-details">
            <div className="campaign-title">{record.campaign}</div>
            {record.dates && <div className="campaign-date">{record.dates}</div>}
          </div>
        </div>
      );
    }
    
    // Level 1 or higher just shows text with appropriate indentation
    return (
      <div style={{ paddingLeft: campaignIndent + (level > 0 ? 0 : 0) }}>
        <div className="campaign-title">{record.campaign}</div>
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
                <div className="action-item">Modifier</div>
                <div className="action-item">Dupliquer</div>
                <div className="action-item">Supprimer</div>
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

  // Configure status column
  const renderStatusColumn = (value: string) => {
    return (
      <div className="status-indicator">
        <span className="status-dot"></span>
        <span>En cours</span>
      </div>
    );
  };

  // Create expanded set of 16 columns
  const generateColumns = () => {
    const baseColumns = [
      {
        title: 'Campagnes - Marchés',
        dataIndex: 'campaign',
        key: 'campaign',
        width: 280,
        fixed: 'left' as const, // Type fixed correctly
        render: renderCampaignColumn
      }
    ];
    
    // Generate 14 numeric columns
    const numericColumns = Array.from({ length: 14 }, (_, i) => ({
      title: `NB UB - ${i % 2 === 0 ? 'Hyper' : 'Super'} ${Math.floor(i/2) + 1}`,
      dataIndex: `nbUb${i % 2 === 0 ? 'Hyper' : 'Super'}${Math.floor(i/2) + 1}`,
      key: `nbUb${i % 2 === 0 ? 'Hyper' : 'Super'}${Math.floor(i/2) + 1}`,
      width: 150,
      editable: true,
      render: (value: any, record: any) => (
        <EditableCell 
          value={value} 
          record={record} 
          dataIndex={`nbUb${i % 2 === 0 ? 'Hyper' : 'Super'}${Math.floor(i/2) + 1}`}
        />
      )
    }));
    
    const actionColumns = [
      {
        title: 'Statut',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        fixed: 'right' as const, // Fix the Status column to the right
        render: renderStatusColumn
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        width: 100,
        fixed: 'right' as const, // Type fixed correctly
        render: renderActionColumn
      }
    ];
    
    return [...baseColumns, ...numericColumns, ...actionColumns];
  };

  // Handle row expansion - modify to ensure only one root parent is expanded at a time
  const onExpand = (expanded: boolean, record: any) => {
    if (expanded) {
      // If this is a root level row (level 0), close all other root rows
      if (record.level === 0) {
        // Find all currently expanded root level keys
        const rootExpandedKeys = expandedKeys.filter(key => {
          // Find the row by key
          const findRow = (rows: any[]): any => {
            for (const row of rows) {
              if (row.key === key) return row;
              if (row.children) {
                const childRow = findRow(row.children);
                if (childRow) return childRow;
              }
            }
            return null;
          };
          
          const row = findRow(data);
          // If this is a root level row and not the newly expanded one, remove it
          return row && row.level !== 0;
        });
        
        // Set the new expanded keys: current non-root keys + this new key
        setExpandedKeys([...rootExpandedKeys, record.key]);
      } else {
        // If not a root level row, just add to expanded keys
        setExpandedKeys([...expandedKeys, record.key]);
      }
    } else {
      // When collapsing, remove this key and potentially its children
      setExpandedKeys(expandedKeys.filter(k => k !== record.key));
    }
  };

  // Configure row class based on nesting level
  const getRowClassName = (record: any, index: number) => {
    if (record.level === 2) return 'level-2-child';
    return expandedKeys.includes(record.key) ? 'row-expanded' : '';
  };

  return (
    <div className="virtualized-table-container">
      <Table
        columns={generateColumns()}
        dataSource={data}
        rowClassName={getRowClassName}
        expandable={{
          onExpand,
          expandedRowKeys: expandedKeys
        }}
        bordered
        scroll={{ x: 1500, y: 800 }} // Use numeric values for scroll
        pagination={false}
        size="middle"
        virtual={true}
        sticky
      />
      
      <Modal
        title={`Commentaires pour ${selectedRow?.campaign || ''}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <p>Ajoutez vos commentaires pour cette campagne ici.</p>
      </Modal>
    </div>
  );
};

export default VirtualizedTable;
