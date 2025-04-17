
// Utility to generate large sets of mock data for the table

// Campaign types and their colors/labels
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

// Child campaign types and their colors
const childCampaignTypes = [
  { 
    type: 'Épiphanie n°2', 
    shortCode: null,
    color: null
  },
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

const OBJECTIFS_COLUMNS = [
  'nbUbCampagne',
  'nbUbHyper2',
  'nbUbHyper1',
  'nbUbSuper2',
  'nbUbSuper1'
];

// Generate random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a row with random data
function generateRow(campaignType: any, index: number, hasChildren: boolean = false): any {
  const baseValues = {
    nbUbCampagne: 150,
    nbUbHyper2: 125,
    nbUbHyper1: 100,
    nbUbSuper2: 75,
    nbUbSuper1: 300
  };

  return {
    key: `${campaignType.shortCode || campaignType.type}-${index}`,
    campaign: campaignType.type,
    shortCode: campaignType.shortCode,
    color: campaignType.color,
    dates: 'DD/MM/AAAA → DD/MM/AAAA',
    nbUbCampagne: baseValues.nbUbCampagne,
    nbUbHyper2: baseValues.nbUbHyper2,
    nbUbHyper1: baseValues.nbUbHyper1,
    nbUbSuper2: baseValues.nbUbSuper2,
    nbUbSuper1: baseValues.nbUbSuper1,
    status: 'En cours',
    children: hasChildren ? [] : undefined
  };
}

// Generate children for a parent row
function generateChildren(parentIndex: number): any[] {
  // Select a subset of childCampaignTypes
  const selectedTypes = childCampaignTypes.slice(0, getRandomNumber(2, 4));
  return selectedTypes.map((type, index) => {
    // Generate values that will sum up close to parent values
    const baseValue = getRandomNumber(10, 50);
    return {
      key: `child-${parentIndex}-${index}`,
      campaign: type.type,
      shortCode: type.shortCode,
      color: type.color,
      nbUbCampagne: baseValue,
      nbUbHyper2: baseValue - getRandomNumber(0, 15),
      nbUbHyper1: baseValue - getRandomNumber(0, 15),
      nbUbSuper2: baseValue - getRandomNumber(5, 25),
      nbUbSuper1: 300,
      status: 'En cours'
    };
  });
}

// Generate full dataset with parents and children
export function generateTableData(numParents: number): any[] {
  const data = [];

  // First, add the totals row
  data.push({
    key: 'totaux',
    campaign: 'Totaux',
    nbUbCampagne: 10000,
    nbUbHyper2: 10000,
    nbUbHyper1: 10000,
    nbUbSuper2: 10000,
    nbUbSuper1: 10000,
    isTotal: true
  });

  // Then generate regular rows
  for (let i = 0; i < numParents; i++) {
    // Cycle through campaign types
    const campaignType = campaignTypes[i % campaignTypes.length];
    
    // Randomly decide if this row has children
    const hasChildren = Math.random() < 0.3; // 30% chance to have children
    
    const row = generateRow(campaignType, i, hasChildren);
    
    // Generate children if needed
    if (hasChildren) {
      const children = generateChildren(i);
      row.children = children;
      
      // Update parent values to be the sum of children values
      OBJECTIFS_COLUMNS.forEach(col => {
        // Initially set sum of children
        row[col] = children.reduce((sum, child) => sum + (child[col] || 0), 0);
        
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

interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width: number;
  fixed?: 'left' | 'right';
  editable?: boolean;
  render?: (text: any, record: any) => any;
}

export const tableColumns: TableColumn[] = [
  {
    title: 'Campagnes - Marchés',
    dataIndex: 'campaign',
    key: 'campaign',
    width: 250,
    fixed: 'left',
  },
  {
    title: 'NB UB - Campagne',
    dataIndex: 'nbUbCampagne',
    key: 'nbUbCampagne',
    width: 150,
    editable: true
  },
  {
    title: 'NB UB - Hyper 2',
    dataIndex: 'nbUbHyper2',
    key: 'nbUbHyper2',
    width: 150,
    editable: true
  },
  {
    title: 'NB UB - Hyper 1',
    dataIndex: 'nbUbHyper1',
    key: 'nbUbHyper1',
    width: 150,
    editable: true
  },
  {
    title: 'NB UB - Super 2',
    dataIndex: 'nbUbSuper2',
    key: 'nbUbSuper2',
    width: 150,
    editable: true
  },
  {
    title: 'NB UB - Super 1',
    dataIndex: 'nbUbSuper1',
    key: 'nbUbSuper1',
    width: 150,
    editable: true
  },
  {
    title: 'Statut',
    dataIndex: 'status',
    key: 'status',
    width: 120,
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
];
