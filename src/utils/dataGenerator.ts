// Utility to generate large sets of mock data for the table with two-level hierarchy

// Campaign types and their colors/labels for level 0
const campaignTypes = [
  { 
    type: 'Nouvel An', 
    shortCode: 'NA',
    color: '#00CFC1', // Teal
  },
  { 
    type: 'Promo 1', 
    shortCode: 'P1',
    color: '#3469FD', // Blue
  },
  { 
    type: 'Épiphanie', 
    shortCode: 'Ép',
    color: '#01D3A1', // Green
  },
  { 
    type: 'Promo 2', 
    shortCode: 'P2',
    color: '#3469FD', // Blue
  },
  { 
    type: 'Soldes d\'hiver', 
    shortCode: 'SH',
    color: '#00CFC1', // Teal
  },
  { 
    type: 'Promo 3', 
    shortCode: 'P3',
    color: '#3469FD', // Blue
  },
  { 
    type: 'Semaine de la joie', 
    shortCode: 'SN',
    color: '#FDBA33', // Yellow
  },
  { 
    type: 'TPA 4', 
    shortCode: 'T4',
    color: '#F070B6', // Pink
  }
];

// Level 1 campaign types
const level1CampaignTypes = [
  { 
    type: 'Épiphanie n°2', 
    shortCode: null,
    color: null
  },
  { 
    type: 'Super Promo', 
    shortCode: null,
    color: '#5D5FEF'
  },
  { 
    type: 'New Year Special', 
    shortCode: null,
    color: null
  }
];

// Level 2 campaign types
const level2CampaignTypes = [
  { 
    type: 'EPCS', 
    shortCode: null,
    color: '#FF3232', // Red
  },
  { 
    type: 'PGC', 
    shortCode: null,
    color: '#FDBA33', // Yellow
  },
  { 
    type: 'PME', 
    shortCode: null,
    color: null
  },
  { 
    type: 'Bio', 
    shortCode: null,
    color: null
  }
];

// Define all numeric columns we'll be using
const OBJECTIFS_COLUMNS = [];
for (let i = 0; i < 14; i++) {
  OBJECTIFS_COLUMNS.push(`nbUb${i % 2 === 0 ? 'Hyper' : 'Super'}${Math.floor(i/2) + 1}`);
}

// Generate random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a row with random data
function generateRow(campaignType: any, index: number, level: number = 0, hasChildren: boolean = false): any {
  // Create base object with all required columns
  const baseObj: any = {
    key: `${level}-${campaignType.type.replace(/\s+/g, '')}-${index}`,
    campaign: campaignType.type,
    shortCode: campaignType.shortCode,
    color: campaignType.color,
    level: level,
    dates: level === 0 ? 'DD/MM/AAAA → DD/MM/AAAA' : undefined,
    status: 'En cours',
    children: hasChildren ? [] : undefined
  };
  
  // Add all numeric columns
  OBJECTIFS_COLUMNS.forEach(col => {
    baseObj[col] = getRandomNumber(10, 150);
  });
  
  return baseObj;
}

// Generate children for a level 0 parent
function generateLevel1Children(parentIndex: number): any[] {
  // Select a subset of level1CampaignTypes
  const selectedTypes = level1CampaignTypes.slice(0, getRandomNumber(1, 3));
  return selectedTypes.map((type, index) => {
    const hasChildren = Math.random() < 0.7; // 70% chance to have level 2 children
    const level1Child = generateRow(type, parentIndex * 10 + index, 1, hasChildren);
    
    if (hasChildren) {
      level1Child.children = generateLevel2Children(parentIndex, index);
    }
    
    return level1Child;
  });
}

// Generate children for a level 1 parent
function generateLevel2Children(parentIndex: number, level1Index: number): any[] {
  // Select a subset of level2CampaignTypes
  const selectedTypes = level2CampaignTypes.slice(0, getRandomNumber(2, 4));
  return selectedTypes.map((type, index) => {
    return generateRow(type, parentIndex * 100 + level1Index * 10 + index, 2);
  });
}

// Generate full dataset with two levels of hierarchy
export function generateTableData(numParents: number): any[] {
  const data = [];

  // First, add the totals row
  const totalsRow: any = {
    key: 'totaux',
    campaign: 'Totaux',
    isTotal: true
  };
  
  // Add all numeric columns to totals row with value 10000
  OBJECTIFS_COLUMNS.forEach(col => {
    totalsRow[col] = 10000;
  });
  
  data.push(totalsRow);

  // Then generate regular rows
  for (let i = 0; i < numParents; i++) {
    // Cycle through campaign types
    const campaignType = campaignTypes[i % campaignTypes.length];
    
    // All level 0 rows have a chance for children
    const hasChildren = Math.random() < 0.3; // 30% chance to have children
    
    const row = generateRow(campaignType, i, 0, hasChildren);
    
    // Generate level 1 children if needed
    if (hasChildren) {
      const children = generateLevel1Children(i);
      row.children = children;
      
      // Calculate parent values based on children
      OBJECTIFS_COLUMNS.forEach(col => {
        // Initially set sum of children
        row[col] = children.reduce((sum, child) => {
          const childValue = child.children ? 
            child.children.reduce((s: number, c: any) => s + (c[col] || 0), 0) : 
            (child[col] || 0);
          return sum + childValue;
        }, 0);
        
        // 20% chance to manually override the sum (to show orange indicator dots)
        if (Math.random() < 0.2) {
          row[col] += getRandomNumber(5, 15);
        }
      });
    }
    
    data.push(row);
  }
  
  return data;
}

// Define columns for the table
interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width: number;
  fixed?: 'left' | 'right';
  editable?: boolean;
  render?: (text: any, record: any) => any;
}

// We'll dynamically generate columns in the component now, so keep this minimal
export const tableColumns: TableColumn[] = [
  {
    title: 'Campagnes - Marchés',
    dataIndex: 'campaign',
    key: 'campaign',
    width: 250,
    fixed: 'left',
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 100,
    fixed: 'right'
  }
];
