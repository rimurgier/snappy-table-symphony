// Utility to generate large sets of mock data for the table with two-level hierarchy

export type Campaign = {
  name: string
  rayon: string
  dates: string
  shortCode: string
  color: string
}
export interface Category {
  id: string
  name: string
}

export interface Thematic {
  id: string
  name: string
}

export enum ItemId {
  CAMPAIGN = 'campaign',
  THEMATIC = 'thematic',
  CATEGORY = 'category',
  RAYON = 'rayon',
  TOTAL = 'total',
}

export interface Item {
  key: string
  parentKey?: string
  status?: string

  // multi type
  children?: Item[]
  type: ItemId
  level: number // use for css indent
  data: Campaign | Thematic | Category | string

  // Dynamically allow version keys
  [key: `Version${number}`]: number | undefined
}

export interface CompaignItem extends Item {
  type: ItemId.CAMPAIGN
  data: Campaign
  children: ThematicItem[]
}

export interface ThematicItem extends Item {
  type: ItemId.THEMATIC
  data: Thematic
  children: CategoryItem[]
}

export interface CategoryItem extends Item {
  type: ItemId.CATEGORY
  data: Category
  children: RayonItem[]
}

export interface RayonItem extends Item {
  type: ItemId.RAYON
  data: string
}
export interface TotalItem extends Item {
  type: ItemId.TOTAL
  data: string
}

// Define types for our data structure
export type DataItem = CompaignItem | ThematicItem | CategoryItem | RayonItem | TotalItem

// Define all numeric columns we'll be using
const VERSION_COLUMNS = Array.from({ length: 14 }, (_, i) => `Version${i + 1}`)

// Generate random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate two random dates from the current year and return them as a range
const generateRandomDateRange = (): string => {
  const currentYear = new Date().getFullYear()
  let start = new Date(
    currentYear,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  )
  let end = new Date(
    currentYear,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  )

  // Ensure start date is before end date
  if (start > end) {
    ;[start, end] = [end, start]
  }

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return `${formatDate(start)} -> ${formatDate(end)}`
}

const thematics = ['Épiphanie2', 'PME', 'Bio', 'Hallowen', 'La réponse D']
const colors = ['#00CFC1', '#3469FD', '#01D3A1', '#FDBA33', '#F070B6']
const categories = ['PGC', 'EPCS']
const products = ['eau', 'jus', 'soda', 'bière', 'vin']
const statuses = ['Active', 'Inactive', 'Pending', 'Archived']
const sortOption = 'PGC / Liquides'
// Generate a row with random data
function generateRow(type: ItemId, index: number, level = 0, parentKey?: string): Item {
  // Create base object with all required columns

  const baseItem: Partial<DataItem> = {
    type,
    key: `${parentKey ? parentKey + '-' : ''}${level}-${type}-${index}`,
    level,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    children: [],
    parentKey,
  }

  // Add all numeric columns
  VERSION_COLUMNS.forEach((col) => {
    baseItem[col] = getRandomNumber(10, 150)
  })

  switch (type) {
    case ItemId.CAMPAIGN:
      baseItem.data = {
        name: `${thematics[index % thematics.length]}${index}`,
        rayon: sortOption,
        dates: generateRandomDateRange(),
        shortCode: `C${index + 1}`,
        color: colors[Math.floor(Math.random() * colors.length)],
      }
      break
    case ItemId.THEMATIC:
      baseItem.data = {
        id: thematics[index],
        name: thematics[index],
      }
      break
    case ItemId.CATEGORY:
      baseItem.data = {
        id: categories[index],
        name: categories[index],
      }
      break
    case ItemId.RAYON:
      baseItem.data = {
        id: products[index],
        name: products[index],
      }
      break
    case ItemId.TOTAL:
      baseItem.data = 'Totaux'
      break
    default:
      baseItem.data = 'no data found'
      break
  }

  return baseItem as Item
}

// Generate children for a parent based on level
function generateChildren(parentKey: string, level: number): Item[] {
  const dataSources = [thematics, categories, products]
  const itemTypes = [ItemId.THEMATIC, ItemId.CATEGORY, ItemId.RAYON]

  if (level >= dataSources.length) {
    return []
  }

  return dataSources[level].map((_, index) => {
    const child = generateRow(itemTypes[level], index, level + 1, parentKey)
    child.children = generateChildren(child.key, level + 1)
    return child
  })
}

// Generate full dataset with two levels of hierarchy
export function generateTableData(numParents: number): DataItem[] {
  const data = []

  // First, add the totals row
  const totalsRow: DataItem = {
    type: ItemId.TOTAL,
    key: 'totaux',
    data: 'Totaux',
    level: 0,
  }

  // Add all numeric columns to totals row with value 10000
  VERSION_COLUMNS.forEach((col) => {
    totalsRow[col] = 10000
  })

  data.push(totalsRow)

  // Then generate regular rows
  for (let i = 0; i < numParents; i++) {
    // Cycle through campaign types

    const row = generateRow(ItemId.CAMPAIGN, i, 0)
    // Generate children for the campaign
    const children = generateChildren(row.key, 0)
    row.children = children

    // // Calculate parent values based on children
    // VERSION_COLUMNS.forEach((col) => {
    //   // Initially set sum of children
    //   row[col] = children.reduce((sum, child) => {
    //     const calculateChildValue = (item: Item): number => {
    //       if (item.children && item.children.length > 0) {
    //         return item.children.reduce(
    //           (subSum, subChild) => subSum + calculateChildValue(subChild),
    //           0
    //         )
    //       }
    //       return item[col] || 0
    //     }
    //     return sum + calculateChildValue(child)
    //   }, 0)
    VERSION_COLUMNS.forEach((col) => {
      // Initially set sum of children
      row[col] = children.reduce((sum, child) => {
        const childValue = child.children
          ? child.children.reduce((s: number, c: any) => s + (c[col] || 0), 0)
          : child[col] || 0
        return sum + childValue
      }, 0)

      // 20% chance to manually override the sum (to show orange indicator dots)
      if (Math.random() < 0.2) {
        row[col] += getRandomNumber(5, 15)
      }
    })
    data.push(row)
  }

  return data
}

// Define columns for the table
interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width: number
  fixed?: 'left' | 'right'
  editable?: boolean
  render?: (text: any, item: DataItem) => any
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
    fixed: 'right',
  },
]
