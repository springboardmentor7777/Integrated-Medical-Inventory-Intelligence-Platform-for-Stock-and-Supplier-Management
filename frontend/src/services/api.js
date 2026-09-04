import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medistock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- LOCAL STORAGE PERSISTENCE HELPERS ---
const getStorage = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setStorage = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// --- INITIAL MOCK DATASETS ---
const INITIAL_CATEGORIES = [
  { id: 1, name: 'Antibiotics', code: 'CAT-ANT', description: 'Bacterial infection treatments and penicillin derivatives', storage: 'Room Temperature (15-25°C)' },
  { id: 2, name: 'Analgesics & Pain Relievers', code: 'CAT-ANA', description: 'Pain relief, antipyretics and anti-inflammatory drugs', storage: 'Dry & Cool place' },
  { id: 3, name: 'Cardiovascular', code: 'CAT-CRD', description: 'Heart, cholesterol and hypertension control medications', storage: 'Room Temperature (15-25°C)' },
  { id: 4, name: 'Antidiabetics & Hormones', code: 'CAT-DIA', description: 'Insulin, GLP-1 analogs and glucose regulators', storage: 'Cold Chain (2-8°C)' },
  { id: 5, name: 'Respiratory & Antiallergic', code: 'CAT-RES', description: 'Bronchodilators, antihistamines and inhalers', storage: 'Protect from sunlight' },
  { id: 6, name: 'Vitamins & Minerals', code: 'CAT-VIT', description: 'Therapeutic supplements and micronutrients', storage: 'Dry place' }
];

const INITIAL_SUPPLIERS = [
  {
    id: 1,
    name: 'Apex Pharmaceuticals Ltd',
    contactPerson: 'David Vance',
    email: 'orders@apexpharma.com',
    phone: '+1 (555) 432-8901',
    address: '450 Science Park Way, Boston, MA',
    taxId: 'US-TAX-892019',
    paymentTerms: 'Net 30',
    status: 'ACTIVE',
    rating: 4.9,
    onTimeDeliveryRate: 98.5,
    leadTimeDays: 3,
    totalOrders: 28,
    totalSpent: 48900.00
  },
  {
    id: 2,
    name: 'Global Health Distribution',
    contactPerson: 'Maria Rodriguez',
    email: 'supply@globalhealth.org',
    phone: '+1 (555) 789-2341',
    address: '102 Industrial Blvd, Chicago, IL',
    taxId: 'US-TAX-445102',
    paymentTerms: 'Net 45',
    status: 'ACTIVE',
    rating: 4.6,
    onTimeDeliveryRate: 94.0,
    leadTimeDays: 5,
    totalOrders: 19,
    totalSpent: 31250.00
  },
  {
    id: 3,
    name: 'BioMed Life Sciences',
    contactPerson: 'Dr. Arthur Chen',
    email: 'biologics@biomedsciences.com',
    phone: '+1 (555) 901-6745',
    address: '78 BioTech Lane, San Diego, CA',
    taxId: 'US-TAX-778901',
    paymentTerms: 'Net 15',
    status: 'ACTIVE',
    rating: 4.8,
    onTimeDeliveryRate: 99.0,
    leadTimeDays: 2,
    totalOrders: 34,
    totalSpent: 62400.00
  },
  {
    id: 4,
    name: 'MedTech Care Solutions',
    contactPerson: 'Claire Dubois',
    email: 'contact@medtechcare.com',
    phone: '+1 (555) 345-6712',
    address: '12 Health Plaza, Atlanta, GA',
    taxId: 'US-TAX-120934',
    paymentTerms: 'Due on Receipt',
    status: 'INACTIVE',
    rating: 3.9,
    onTimeDeliveryRate: 85.0,
    leadTimeDays: 7,
    totalOrders: 8,
    totalSpent: 12500.00
  }
];

const INITIAL_MEDICINES = [
  {
    id: 1,
    name: 'Amoxicillin Trihydrate 500mg',
    code: 'MED-AMX-500',
    categoryId: 1,
    categoryName: 'Antibiotics',
    supplierId: 1,
    supplierName: 'Apex Pharmaceuticals Ltd',
    dosageForm: 'Capsules',
    storageCondition: 'Room Temperature (15-25°C)',
    description: 'Broad-spectrum penicillin antibiotic capsules for bacterial infections',
    unitPrice: 14.50,
    reorderLevel: 30,
    totalQuantity: 150,
    stockStatus: 'IN_STOCK',
    expiryStatus: 'VALID',
    nearestExpiryDate: '2027-12-15',
    batches: [
      { id: 101, batchNumber: 'BAT-AMX-2025A', quantity: 150, mfgDate: '2025-01-10', expiryDate: '2027-12-15', purchasePrice: 9.20, expiryStatus: 'VALID' }
    ]
  },
  {
    id: 2,
    name: 'Paracetamol 650mg (Dolo)',
    code: 'MED-PCM-650',
    categoryId: 2,
    categoryName: 'Analgesics & Pain Relievers',
    supplierId: 2,
    supplierName: 'Global Health Distribution',
    dosageForm: 'Tablets',
    storageCondition: 'Dry & Cool place',
    description: 'Analgesic and antipyretic tablets for pain and fever control',
    unitPrice: 6.00,
    reorderLevel: 50,
    totalQuantity: 12,
    stockStatus: 'LOW_STOCK',
    expiryStatus: 'VALID',
    nearestExpiryDate: '2027-06-20',
    batches: [
      { id: 102, batchNumber: 'BAT-PCM-2025B', quantity: 12, mfgDate: '2025-02-15', expiryDate: '2027-06-20', purchasePrice: 3.50, expiryStatus: 'VALID' }
    ]
  },
  {
    id: 3,
    name: 'Metformin HCl 500mg',
    code: 'MED-MET-500',
    categoryId: 4,
    categoryName: 'Antidiabetics & Hormones',
    supplierId: 1,
    supplierName: 'Apex Pharmaceuticals Ltd',
    dosageForm: 'Tablets',
    storageCondition: 'Room Temperature (15-25°C)',
    description: 'First-line medication for type 2 diabetes blood sugar management',
    unitPrice: 18.75,
    reorderLevel: 25,
    totalQuantity: 0,
    stockStatus: 'OUT_OF_STOCK',
    expiryStatus: 'VALID',
    nearestExpiryDate: '2027-01-10',
    batches: [
      { id: 103, batchNumber: 'BAT-MET-2024X', quantity: 0, mfgDate: '2024-03-01', expiryDate: '2027-01-10', purchasePrice: 11.00, expiryStatus: 'VALID' }
    ]
  },
  {
    id: 4,
    name: 'Insulin Glargine 100IU/ml Pen',
    code: 'MED-INS-100',
    categoryId: 4,
    categoryName: 'Antidiabetics & Hormones',
    supplierId: 3,
    supplierName: 'BioMed Life Sciences',
    dosageForm: 'Injectable Pen',
    storageCondition: 'Cold Chain (2-8°C)',
    description: 'Long-acting basal insulin analog for 24-hour glycemic control',
    unitPrice: 85.00,
    reorderLevel: 15,
    totalQuantity: 40,
    stockStatus: 'IN_STOCK',
    expiryStatus: 'EXPIRING_SOON',
    nearestExpiryDate: '2026-09-12',
    batches: [
      { id: 104, batchNumber: 'BAT-INS-2025C', quantity: 40, mfgDate: '2025-01-05', expiryDate: '2026-09-12', purchasePrice: 60.00, expiryStatus: 'EXPIRING_SOON' }
    ]
  },
  {
    id: 5,
    name: 'Azithromycin 250mg Tablets',
    code: 'MED-AZI-250',
    categoryId: 1,
    categoryName: 'Antibiotics',
    supplierId: 2,
    supplierName: 'Global Health Distribution',
    dosageForm: 'Tablets',
    storageCondition: 'Room Temperature (15-25°C)',
    description: 'Macrolide antibiotic for upper and lower respiratory tract infections',
    unitPrice: 22.00,
    reorderLevel: 20,
    totalQuantity: 18,
    stockStatus: 'LOW_STOCK',
    expiryStatus: 'EXPIRED',
    nearestExpiryDate: '2026-08-05',
    batches: [
      { id: 105, batchNumber: 'BAT-AZI-2023OLD', quantity: 18, mfgDate: '2023-08-01', expiryDate: '2026-08-05', purchasePrice: 14.00, expiryStatus: 'EXPIRED' }
    ]
  },
  {
    id: 6,
    name: 'Atorvastatin Calcium 20mg',
    code: 'MED-ATO-020',
    categoryId: 3,
    categoryName: 'Cardiovascular',
    supplierId: 1,
    supplierName: 'Apex Pharmaceuticals Ltd',
    dosageForm: 'Tablets',
    storageCondition: 'Room Temperature (15-25°C)',
    description: 'Statin lipid-lowering medication used to prevent cardiovascular disease',
    unitPrice: 32.50,
    reorderLevel: 30,
    totalQuantity: 200,
    stockStatus: 'IN_STOCK',
    expiryStatus: 'VALID',
    nearestExpiryDate: '2028-04-30',
    batches: [
      { id: 106, batchNumber: 'BAT-ATO-2025D', quantity: 200, mfgDate: '2025-04-01', expiryDate: '2028-04-30', purchasePrice: 20.00, expiryStatus: 'VALID' }
    ]
  }
];

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    email: 'admin@medistock.com',
    role: 'ADMIN',
    department: 'Hospital Administration & Pharmacy Board',
    phone: '+1 (555) 019-2834',
    licenseNumber: 'ADM-99820-US',
    status: 'ACTIVE',
    lastLogin: 'Today, 09:14 AM',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    name: 'Alex Mercer, PharmD',
    email: 'pharmacist@medistock.com',
    role: 'PHARMACIST',
    department: 'Inpatient Central Pharmacy',
    phone: '+1 (555) 234-5678',
    licenseNumber: 'PH-884920-US',
    status: 'ACTIVE',
    lastLogin: 'Today, 10:45 AM',
    createdAt: '2025-02-01'
  },
  {
    id: 3,
    name: 'Marcus Vance',
    email: 'marcus.vance@medistock.com',
    role: 'INVENTORY_MANAGER',
    department: 'Supply Chain & Logistics',
    phone: '+1 (555) 876-5432',
    licenseNumber: 'LOG-44109-US',
    status: 'ACTIVE',
    lastLogin: 'Yesterday, 04:30 PM',
    createdAt: '2025-03-10'
  },
  {
    id: 4,
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@medistock.com',
    role: 'DOCTOR',
    department: 'Internal Medicine & Cardiology',
    phone: '+1 (555) 345-9876',
    licenseNumber: 'MD-771928-US',
    status: 'ACTIVE',
    lastLogin: '2 days ago',
    createdAt: '2025-04-05'
  },
  {
    id: 5,
    name: 'Chloe Bennett, RN',
    email: 'chloe.bennett@medistock.com',
    role: 'NURSE',
    department: 'Emergency & Critical Care',
    phone: '+1 (555) 678-1234',
    licenseNumber: 'RN-332901-US',
    status: 'ACTIVE',
    lastLogin: '3 days ago',
    createdAt: '2025-05-12'
  }
];

const INITIAL_ROLES = [
  {
    id: 'ADMIN',
    name: 'System Administrator',
    description: 'Full unrestricted access to all services, user roles, security settings, and inventory.',
    userCount: 1,
    permissions: [
      'read_inventory', 'write_inventory', 'dispense_medicine', 'manage_suppliers', 
      'manage_users', 'manage_roles', 'stock_adjustments', 'view_analytics', 
      'export_reports', 'delete_records'
    ]
  },
  {
    id: 'PHARMACIST',
    name: 'Clinical Pharmacist',
    description: 'Manage medicine inventory, dispense stock, manage batches, and create restock requests.',
    userCount: 1,
    permissions: [
      'read_inventory', 'write_inventory', 'dispense_medicine', 'manage_suppliers', 
      'stock_adjustments', 'view_analytics', 'export_reports'
    ]
  },
  {
    id: 'INVENTORY_MANAGER',
    name: 'Inventory & Supply Manager',
    description: 'Supplier orders, receiving shipments, stock adjustments, and inventory monitoring.',
    userCount: 1,
    permissions: [
      'read_inventory', 'write_inventory', 'manage_suppliers', 'stock_adjustments', 
      'view_analytics', 'export_reports'
    ]
  },
  {
    id: 'DOCTOR',
    name: 'Medical Doctor',
    description: 'View medicine catalog, check availability, request prescriptions and view reports.',
    userCount: 1,
    permissions: [
      'read_inventory', 'dispense_medicine', 'view_analytics'
    ]
  },
  {
    id: 'NURSE',
    name: 'Staff Nurse',
    description: 'Check medicine stock levels and dispense medications at ward units.',
    userCount: 1,
    permissions: [
      'read_inventory', 'dispense_medicine'
    ]
  }
];

const INITIAL_PURCHASE_ORDERS = [
  {
    id: 1,
    poNumber: 'PO-2026-081',
    supplierId: 1,
    supplierName: 'Apex Pharmaceuticals Ltd',
    orderDate: '2026-08-15',
    expectedDeliveryDate: '2026-08-25',
    status: 'SHIPPED',
    totalAmount: 1850.00,
    items: [
      { medicineName: 'Metformin HCl 500mg', quantity: 100, unitPrice: 11.00, total: 1100.00 },
      { medicineName: 'Amoxicillin Trihydrate 500mg', quantity: 75, unitPrice: 10.00, total: 750.00 }
    ],
    notes: 'Urgent restock for out of stock antidiabetics.'
  },
  {
    id: 2,
    poNumber: 'PO-2026-082',
    supplierId: 3,
    supplierName: 'BioMed Life Sciences',
    orderDate: '2026-08-18',
    expectedDeliveryDate: '2026-08-28',
    status: 'APPROVED',
    totalAmount: 4250.00,
    items: [
      { medicineName: 'Insulin Glargine 100IU/ml Pen', quantity: 50, unitPrice: 85.00, total: 4250.00 }
    ],
    notes: 'Cold-chain shipment container required.'
  },
  {
    id: 3,
    poNumber: 'PO-2026-079',
    supplierId: 2,
    supplierName: 'Global Health Distribution',
    orderDate: '2026-08-01',
    expectedDeliveryDate: '2026-08-06',
    status: 'DELIVERED',
    totalAmount: 920.00,
    items: [
      { medicineName: 'Paracetamol 650mg (Dolo)', quantity: 200, unitPrice: 4.60, total: 920.00 }
    ],
    notes: 'Completed delivery received by Station #1.'
  }
];

const INITIAL_ADJUSTMENTS = [
  {
    id: 1,
    medicineId: 5,
    medicineName: 'Azithromycin 250mg Tablets',
    batchNumber: 'BAT-AZI-2023OLD',
    type: 'OUT',
    reason: 'DISPOSAL_EXPIRED',
    quantity: 18,
    previousStock: 36,
    newStock: 18,
    adjustedBy: 'Alex Mercer, PharmD',
    timestamp: '2026-08-20T14:30:00Z',
    notes: 'Quarantined and disposed expired batch per FDA guidelines'
  },
  {
    id: 2,
    medicineId: 1,
    medicineName: 'Amoxicillin Trihydrate 500mg',
    batchNumber: 'BAT-AMX-2025A',
    type: 'IN',
    reason: 'SHIPMENT_RECEIVED',
    quantity: 150,
    previousStock: 0,
    newStock: 150,
    adjustedBy: 'Marcus Vance',
    timestamp: '2026-08-19T10:15:00Z',
    notes: 'Received shipment from Apex Pharma PO-2026-075'
  },
  {
    id: 3,
    medicineId: 2,
    medicineName: 'Paracetamol 650mg (Dolo)',
    batchNumber: 'BAT-PCM-2025B',
    type: 'OUT',
    reason: 'DISPENSED',
    quantity: 38,
    previousStock: 50,
    newStock: 12,
    adjustedBy: 'Dr. Sarah Jenkins',
    timestamp: '2026-08-21T08:45:00Z',
    notes: 'Dispensed to Inpatient Ward Unit 3'
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 1,
    action: 'USER_LOGIN',
    user: 'Dr. Sarah Jenkins',
    role: 'ADMIN',
    details: 'JWT token issued successfully via OAuth2 SSO',
    ipAddress: '192.168.1.104',
    timestamp: '2026-08-21T09:14:00Z',
    status: 'SUCCESS'
  },
  {
    id: 2,
    action: 'STOCK_ADJUSTMENT',
    user: 'Alex Mercer, PharmD',
    role: 'PHARMACIST',
    details: 'Disposed 18 units of expired Azithromycin 250mg (Batch #BAT-AZI-2023OLD)',
    ipAddress: '192.168.1.112',
    timestamp: '2026-08-20T14:30:00Z',
    status: 'SUCCESS'
  },
  {
    id: 3,
    action: 'PURCHASE_ORDER_CREATED',
    user: 'Marcus Vance',
    role: 'INVENTORY_MANAGER',
    details: 'Created PO-2026-082 for BioMed Life Sciences (Amount: $4,250.00)',
    ipAddress: '192.168.1.120',
    timestamp: '2026-08-18T11:20:00Z',
    status: 'SUCCESS'
  },
  {
    id: 4,
    action: 'ROLE_PERMISSION_UPDATED',
    user: 'Dr. Sarah Jenkins',
    role: 'ADMIN',
    details: 'Updated permission matrix for Clinical Pharmacist role',
    ipAddress: '192.168.1.104',
    timestamp: '2026-08-17T16:00:00Z',
    status: 'SUCCESS'
  }
];

// Helper to simulate network latency
const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

// ==========================================
// 1. AUTHENTICATION SERVICE
// ==========================================
export const AuthService = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;
      const user = res.data.user;
      localStorage.setItem('medistock_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('medistock_user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      AuthService.logAudit('USER_LOGIN', user.name, user.role, 'User signed in via REST API', 'SUCCESS');
      return { token, user };
    } catch (err) {
      // Standalone interactive mock fallback
      const users = getStorage('medistock_users_db', INITIAL_USERS);
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      const userObj = matched || {
        id: Date.now(),
        name: email.includes('admin') ? 'Dr. Sarah Jenkins' : (email.includes('pharm') ? 'Alex Mercer, PharmD' : email.split('@')[0]),
        email: email,
        role: email.includes('admin') ? 'ADMIN' : (email.includes('pharm') ? 'PHARMACIST' : (email.includes('manager') ? 'INVENTORY_MANAGER' : (email.includes('doc') ? 'DOCTOR' : 'NURSE'))),
        department: 'Medical Operations',
        phone: '+1 555-0192',
        licenseNumber: 'LIC-' + Math.floor(Math.random() * 100000),
        status: 'ACTIVE'
      };

      const mockJwtPayload = {
        sub: userObj.email,
        name: userObj.name,
        role: userObj.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (3600 * 24)
      };

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
        btoa(JSON.stringify(mockJwtPayload)) + '.' + 
        btoa('signature_demo_' + Date.now());

      localStorage.setItem('medistock_token', mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('medistock_user', JSON.stringify(userObj));
      localStorage.setItem('user', JSON.stringify(userObj));

      AuthService.logAudit('USER_LOGIN', userObj.name, userObj.role, 'User signed in successfully', 'SUCCESS');

      return { token: mockToken, user: userObj };
    }
  },

  oauthLogin: async (provider = 'Google Health') => {
    await delay();
    const userObj = {
      id: 99,
      name: 'Dr. Sarah Jenkins',
      email: 'admin@medistock.com',
      role: 'ADMIN',
      department: 'Hospital Administration & Pharmacy Board',
      phone: '+1 (555) 019-2834',
      licenseNumber: 'ADM-99820-US',
      status: 'ACTIVE',
      authProvider: provider
    };

    const mockJwtPayload = {
      sub: userObj.email,
      name: userObj.name,
      role: userObj.role,
      provider: provider,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (3600 * 24)
    };

    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
      btoa(JSON.stringify(mockJwtPayload)) + '.' + 
      btoa('sso_signature_' + Date.now());

    localStorage.setItem('medistock_token', mockToken);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('medistock_user', JSON.stringify(userObj));

    AuthService.logAudit('OAUTH2_LOGIN', userObj.name, userObj.role, `Authenticated via ${provider} SSO`, 'SUCCESS');
    return { token: mockToken, user: userObj };
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const token = res.data.token;
      const user = res.data.user;
      localStorage.setItem('medistock_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('medistock_user', JSON.stringify(user));
      AuthService.logAudit('USER_REGISTER', user.name, user.role, 'New account registered via API', 'SUCCESS');
      return { token, user };
    } catch (err) {
      await delay();
      const users = getStorage('medistock_users_db', INITIAL_USERS);
      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'PHARMACIST',
        department: userData.department || 'General Medicine',
        phone: userData.phone || '+1 555-0000',
        licenseNumber: userData.licenseNumber || 'LIC-' + Math.floor(Math.random() * 100000),
        status: 'ACTIVE',
        lastLogin: 'Just now',
        createdAt: new Date().toISOString().split('T')[0]
      };
      users.unshift(newUser);
      setStorage('medistock_users_db', users);

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify(newUser)) + '.' + btoa('new_user_sig');
      localStorage.setItem('medistock_token', mockToken);
      localStorage.setItem('token', mockToken);
      localStorage.setItem('medistock_user', JSON.stringify(newUser));
      AuthService.logAudit('USER_REGISTER', newUser.name, newUser.role, 'New account registered', 'SUCCESS');

      return { token: mockToken, user: newUser };
    }
  },

  resetPasswordRequest: async (email) => {
    await delay();
    return {
      success: true,
      message: `Password reset instructions and verification OTP have been dispatched to ${email}.`
    };
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/users/me', data);
      const updatedUser = res.data;
      localStorage.setItem('medistock_user', JSON.stringify(updatedUser));
      AuthService.logAudit('PROFILE_UPDATE', updatedUser.name, updatedUser.role, 'Updated profile via API', 'SUCCESS');
      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    } catch (err) {
      await delay();
      const existingUserStr = localStorage.getItem('medistock_user');
      const existingUser = existingUserStr ? JSON.parse(existingUserStr) : {};
      const updatedUser = { ...existingUser, ...data };
      
      const users = getStorage('medistock_users_db', INITIAL_USERS);
      const idx = users.findIndex(u => u.email === updatedUser.email || u.id === updatedUser.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updatedUser };
        setStorage('medistock_users_db', users);
      }
      localStorage.setItem('medistock_user', JSON.stringify(updatedUser));

      AuthService.logAudit('PROFILE_UPDATE', updatedUser.name, updatedUser.role, 'Updated profile information', 'SUCCESS');
      return { success: true, user: updatedUser, message: 'Profile updated successfully' };
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      await api.put('/users/me', { password: newPassword });
      AuthService.logAudit('PASSWORD_CHANGE', 'Current User', 'USER', 'Changed account password via API', 'SUCCESS');
      return { success: true, message: 'Password updated successfully' };
    } catch (err) {
      await delay();
      if (currentPassword && newPassword && newPassword.length >= 6) {
        AuthService.logAudit('PASSWORD_CHANGE', 'Current User', 'USER', 'Changed account password', 'SUCCESS');
        return { success: true, message: 'Password updated successfully' };
      }
      throw new Error('New password must be at least 6 characters.');
    }
  },

  logAudit: (action, user, role, details, status = 'SUCCESS') => {
    const logs = getStorage('medistock_audit_logs', INITIAL_AUDIT_LOGS);
    logs.unshift({
      id: Date.now(),
      action,
      user: user || 'Dr. Alex Mercer',
      role: role || 'PHARMACIST',
      details,
      ipAddress: '192.168.1.' + (100 + Math.floor(Math.random() * 50)),
      timestamp: new Date().toISOString(),
      status
    });
    setStorage('medistock_audit_logs', logs.slice(0, 100));
  }
};

// ==========================================
// 2. USER & ROLE MANAGEMENT SERVICE
// ==========================================
export const UserService = {
  getUsers: async () => {
    try {
      const res = await api.get('/users');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStorage('medistock_users_db', res.data);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    return getStorage('medistock_users_db', INITIAL_USERS);
  },

  createUser: async (userData) => {
    try {
      const res = await api.post('/users', userData);
      if (res.data) {
        AuthService.logAudit('USER_CREATED', 'Admin', 'ADMIN', `Created new user ${res.data.name} via API`);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    const users = getStorage('medistock_users_db', INITIAL_USERS);
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'PHARMACIST',
      department: userData.department || 'Central Pharmacy',
      phone: userData.phone || '+1 555-0100',
      licenseNumber: userData.licenseNumber || 'LIC-' + Math.floor(Math.random() * 100000),
      status: userData.status || 'ACTIVE',
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };
    users.unshift(newUser);
    setStorage('medistock_users_db', users);
    AuthService.logAudit('USER_CREATED', 'Admin', 'ADMIN', `Created new user ${newUser.name} (${newUser.role})`);
    return newUser;
  },

  updateUser: async (id, updatedData) => {
    try {
      const res = await api.put(`/users/${id}`, updatedData);
      if (res.data) {
        AuthService.logAudit('USER_UPDATED', 'Admin', 'ADMIN', `Updated user ${res.data.name} via API`);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    const users = getStorage('medistock_users_db', INITIAL_USERS);
    const idx = users.findIndex(u => u.id === Number(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedData };
      setStorage('medistock_users_db', users);
      AuthService.logAudit('USER_UPDATED', 'Admin', 'ADMIN', `Updated user ${users[idx].name}`);
      return users[idx];
    }
    throw new Error('User not found');
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
    } catch (err) {
      // Fallback
    }
    await delay();
    let users = getStorage('medistock_users_db', INITIAL_USERS);
    const target = users.find(u => u.id === Number(id));
    users = users.filter(u => u.id !== Number(id));
    setStorage('medistock_users_db', users);
    AuthService.logAudit('USER_DELETED', 'Admin', 'ADMIN', `Deleted user account: ${target?.name || id}`);
    return { success: true };
  },

  getRoles: async () => {
    try {
      const res = await api.get('/users/roles');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    return getStorage('medistock_roles_db', INITIAL_ROLES);
  },

  updateRolePermissions: async (roleId, permissions) => {
    await delay();
    const roles = getStorage('medistock_roles_db', INITIAL_ROLES);
    const idx = roles.findIndex(r => r.id === roleId);
    if (idx !== -1) {
      roles[idx].permissions = permissions;
      setStorage('medistock_roles_db', roles);
      AuthService.logAudit('ROLE_PERMISSIONS_UPDATED', 'Admin', 'ADMIN', `Updated permissions for role ${roleId}`);
      return roles[idx];
    }
    throw new Error('Role not found');
  },

  getAuditLogs: async () => {
    await delay();
    return getStorage('medistock_audit_logs', INITIAL_AUDIT_LOGS);
  }
};

// ==========================================
// 3. MEDICINE INVENTORY MANAGEMENT SERVICE
// ==========================================
export const MedicineService = {
  getAll: async (params = {}) => {
    try {
      const res = await api.get('/inventory');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const localMeds = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
        const mapped = res.data.map(inv => {
          const matched = localMeds.find(m => m.id === inv.medicineId || m.name === inv.medicineName);
          return {
            id: inv.medicineId || inv.id,
            name: inv.medicineName,
            code: inv.medicineCode,
            categoryName: inv.categoryName || matched?.categoryName || 'General',
            categoryId: matched?.categoryId || 1,
            supplierName: inv.supplierName || matched?.supplierName || 'Apex Pharmaceuticals Ltd',
            supplierId: matched?.supplierId || 1,
            dosageForm: matched?.dosageForm || 'Tablets',
            storageCondition: matched?.storageCondition || 'Room Temperature (15-25°C)',
            description: matched?.description || '',
            unitPrice: matched?.unitPrice || 15.00,
            reorderLevel: inv.reorderLevel !== undefined ? inv.reorderLevel : (matched?.reorderLevel || 20),
            totalQuantity: inv.quantity !== undefined ? inv.quantity : (matched?.totalQuantity || 0),
            stockStatus: inv.stockStatus || (inv.quantity <= 0 ? 'OUT_OF_STOCK' : (inv.quantity <= inv.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK')),
            expiryStatus: matched?.expiryStatus || 'VALID',
            nearestExpiryDate: matched?.nearestExpiryDate || '2027-12-31',
            batches: matched?.batches || []
          };
        });
        
        let filtered = [...mapped];
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(m => 
            m.name?.toLowerCase().includes(q) || 
            m.code?.toLowerCase().includes(q) || 
            m.categoryName?.toLowerCase().includes(q) ||
            m.supplierName?.toLowerCase().includes(q)
          );
        }
        if (params.categoryId && params.categoryId !== 'ALL') {
          filtered = filtered.filter(m => m.categoryId === Number(params.categoryId));
        }
        if (params.stockStatus && params.stockStatus !== 'ALL') {
          filtered = filtered.filter(m => m.stockStatus === params.stockStatus);
        }
        if (params.expiryStatus && params.expiryStatus !== 'ALL') {
          filtered = filtered.filter(m => m.expiryStatus === params.expiryStatus);
        }
        return filtered;
      }
    } catch (err) {
      // Fallback
    }

    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    let filtered = [...medicines];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.code.toLowerCase().includes(q) || 
        m.categoryName?.toLowerCase().includes(q) ||
        m.supplierName?.toLowerCase().includes(q)
      );
    }
    if (params.categoryId && params.categoryId !== 'ALL') {
      filtered = filtered.filter(m => m.categoryId === Number(params.categoryId));
    }
    if (params.stockStatus && params.stockStatus !== 'ALL') {
      filtered = filtered.filter(m => m.stockStatus === params.stockStatus);
    }
    if (params.expiryStatus && params.expiryStatus !== 'ALL') {
      filtered = filtered.filter(m => m.expiryStatus === params.expiryStatus);
    }
    return filtered;
  },

  getById: async (id) => {
    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    return medicines.find(m => m.id === Number(id)) || medicines[0];
  },

  create: async (data) => {
    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    const initialQty = Number(data.initialQuantity || 0);
    const reorderLvl = Number(data.reorderLevel || 20);
    
    let stockStatus = 'IN_STOCK';
    if (initialQty <= 0) stockStatus = 'OUT_OF_STOCK';
    else if (initialQty <= reorderLvl) stockStatus = 'LOW_STOCK';

    const batch = data.batchNumber ? [{
      id: Date.now() + 1,
      batchNumber: data.batchNumber,
      quantity: initialQty,
      mfgDate: data.mfgDate || '2025-01-01',
      expiryDate: data.expiryDate || '2027-12-31',
      purchasePrice: Number(data.purchasePrice || (data.unitPrice * 0.7)),
      expiryStatus: 'VALID'
    }] : [];

    const newMed = {
      id: Date.now(),
      name: data.name,
      code: data.code || 'MED-' + Math.floor(Math.random() * 1000),
      categoryId: Number(data.categoryId || 1),
      categoryName: data.categoryName || 'General',
      supplierId: Number(data.supplierId || 1),
      supplierName: data.supplierName || 'Apex Pharmaceuticals Ltd',
      dosageForm: data.dosageForm || 'Tablets',
      storageCondition: data.storageCondition || 'Room Temperature (15-25°C)',
      description: data.description || '',
      unitPrice: Number(data.unitPrice || 10),
      reorderLevel: reorderLvl,
      totalQuantity: initialQty,
      stockStatus: stockStatus,
      expiryStatus: 'VALID',
      nearestExpiryDate: data.expiryDate || '2027-12-31',
      batches: batch
    };

    medicines.unshift(newMed);
    setStorage('medistock_medicines_db', medicines);
    AuthService.logAudit('MEDICINE_CREATED', 'Pharmacist', 'PHARMACIST', `Added new medicine: ${newMed.name} (${newMed.code})`);
    return newMed;
  },

  update: async (id, data) => {
    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    const idx = medicines.findIndex(m => m.id === Number(id));
    if (idx !== -1) {
      const current = medicines[idx];
      const updatedTotalQty = data.totalQuantity !== undefined ? Number(data.totalQuantity) : current.totalQuantity;
      const updatedReorder = data.reorderLevel !== undefined ? Number(data.reorderLevel) : current.reorderLevel;

      let stockStatus = 'IN_STOCK';
      if (updatedTotalQty <= 0) stockStatus = 'OUT_OF_STOCK';
      else if (updatedTotalQty <= updatedReorder) stockStatus = 'LOW_STOCK';

      medicines[idx] = {
        ...current,
        ...data,
        totalQuantity: updatedTotalQty,
        reorderLevel: updatedReorder,
        stockStatus: stockStatus
      };
      setStorage('medistock_medicines_db', medicines);
      AuthService.logAudit('MEDICINE_UPDATED', 'Pharmacist', 'PHARMACIST', `Updated medicine details: ${medicines[idx].name}`);
      return medicines[idx];
    }
    throw new Error('Medicine not found');
  },

  delete: async (id) => {
    await delay();
    let medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    const target = medicines.find(m => m.id === Number(id));
    medicines = medicines.filter(m => m.id !== Number(id));
    setStorage('medistock_medicines_db', medicines);
    AuthService.logAudit('MEDICINE_DELETED', 'Pharmacist', 'PHARMACIST', `Deleted medicine: ${target?.name || id}`);
    return { success: true };
  },

  addBatch: async (medicineId, batchData) => {
    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    const idx = medicines.findIndex(m => m.id === Number(medicineId));
    if (idx !== -1) {
      const newBatch = {
        id: Date.now(),
        batchNumber: batchData.batchNumber || 'BAT-' + Date.now(),
        quantity: Number(batchData.quantity || 0),
        mfgDate: batchData.mfgDate || '2025-01-01',
        expiryDate: batchData.expiryDate || '2027-12-31',
        purchasePrice: Number(batchData.purchasePrice || 10),
        expiryStatus: 'VALID'
      };
      medicines[idx].batches = medicines[idx].batches || [];
      medicines[idx].batches.push(newBatch);
      medicines[idx].totalQuantity = medicines[idx].batches.reduce((sum, b) => sum + Number(b.quantity), 0);
      
      if (medicines[idx].totalQuantity <= 0) medicines[idx].stockStatus = 'OUT_OF_STOCK';
      else if (medicines[idx].totalQuantity <= medicines[idx].reorderLevel) medicines[idx].stockStatus = 'LOW_STOCK';
      else medicines[idx].stockStatus = 'IN_STOCK';

      setStorage('medistock_medicines_db', medicines);
      AuthService.logAudit('BATCH_ADDED', 'Pharmacist', 'PHARMACIST', `Added batch ${newBatch.batchNumber} (${newBatch.quantity} units) to ${medicines[idx].name}`);
      return medicines[idx];
    }
    throw new Error('Medicine not found');
  },

  // Categories
  getCategories: async () => {
    await delay();
    const categories = getStorage('medistock_categories_db', INITIAL_CATEGORIES);
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    return categories.map(cat => ({
      ...cat,
      medicineCount: medicines.filter(m => m.categoryId === cat.id).length
    }));
  },

  createCategory: async (catData) => {
    await delay();
    const categories = getStorage('medistock_categories_db', INITIAL_CATEGORIES);
    const newCat = {
      id: Date.now(),
      name: catData.name,
      code: catData.code || 'CAT-' + catData.name.substring(0, 3).toUpperCase(),
      description: catData.description || '',
      storage: catData.storage || 'Room Temperature (15-25°C)'
    };
    categories.push(newCat);
    setStorage('medistock_categories_db', categories);
    AuthService.logAudit('CATEGORY_CREATED', 'Admin', 'ADMIN', `Created medicine category: ${newCat.name}`);
    return newCat;
  },

  deleteCategory: async (id) => {
    await delay();
    let categories = getStorage('medistock_categories_db', INITIAL_CATEGORIES);
    categories = categories.filter(c => c.id !== Number(id));
    setStorage('medistock_categories_db', categories);
    return { success: true };
  }
};

// ==========================================
// 4. SUPPLIER MANAGEMENT SERVICE
// ==========================================
export const SupplierService = {
  getAll: async (search, status) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (status && status !== 'ALL') params.status = status;
      const res = await api.get('/suppliers', { params });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStorage('medistock_suppliers_db', res.data);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    return getStorage('medistock_suppliers_db', INITIAL_SUPPLIERS);
  },

  create: async (supplierData) => {
    try {
      const res = await api.post('/suppliers', supplierData);
      if (res.data) {
        AuthService.logAudit('SUPPLIER_CREATED', 'Manager', 'INVENTORY_MANAGER', `Added supplier via API: ${res.data.name}`);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    const suppliers = getStorage('medistock_suppliers_db', INITIAL_SUPPLIERS);
    const newSupplier = {
      id: Date.now(),
      name: supplierData.name,
      contactPerson: supplierData.contactPerson,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      taxId: supplierData.taxId || 'US-TAX-' + Math.floor(Math.random() * 900000),
      paymentTerms: supplierData.paymentTerms || 'Net 30',
      status: supplierData.status || 'ACTIVE',
      rating: Number(supplierData.rating || 4.5),
      onTimeDeliveryRate: 95.0,
      leadTimeDays: Number(supplierData.leadTimeDays || 4),
      totalOrders: 0,
      totalSpent: 0
    };
    suppliers.unshift(newSupplier);
    setStorage('medistock_suppliers_db', suppliers);
    AuthService.logAudit('SUPPLIER_CREATED', 'Manager', 'INVENTORY_MANAGER', `Added supplier: ${newSupplier.name}`);
    return newSupplier;
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/suppliers/${id}`, data);
      if (res.data) {
        AuthService.logAudit('SUPPLIER_UPDATED', 'Manager', 'INVENTORY_MANAGER', `Updated supplier via API: ${res.data.name}`);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    const suppliers = getStorage('medistock_suppliers_db', INITIAL_SUPPLIERS);
    const idx = suppliers.findIndex(s => s.id === Number(id));
    if (idx !== -1) {
      suppliers[idx] = { ...suppliers[idx], ...data };
      setStorage('medistock_suppliers_db', suppliers);
      AuthService.logAudit('SUPPLIER_UPDATED', 'Manager', 'INVENTORY_MANAGER', `Updated supplier details: ${suppliers[idx].name}`);
      return suppliers[idx];
    }
    throw new Error('Supplier not found');
  },

  delete: async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
    } catch (err) {
      // Fallback
    }
    await delay();
    let suppliers = getStorage('medistock_suppliers_db', INITIAL_SUPPLIERS);
    suppliers = suppliers.filter(s => s.id !== Number(id));
    setStorage('medistock_suppliers_db', suppliers);
    return { success: true };
  },

  // Purchase Orders
  getPurchaseOrders: async () => {
    try {
      const res = await api.get('/purchases');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStorage('medistock_purchase_orders', res.data);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    return getStorage('medistock_purchase_orders', INITIAL_PURCHASE_ORDERS);
  },

  createPurchaseOrder: async (poData) => {
    try {
      const res = await api.post('/purchases', poData);
      if (res.data) {
        AuthService.logAudit('PURCHASE_ORDER_CREATED', 'Manager', 'INVENTORY_MANAGER', `Created ${res.data.poNumber} via API`);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    const orders = getStorage('medistock_purchase_orders', INITIAL_PURCHASE_ORDERS);
    const newPO = {
      id: Date.now(),
      poNumber: 'PO-2026-' + (100 + orders.length + 1),
      supplierId: Number(poData.supplierId),
      supplierName: poData.supplierName,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: poData.expectedDeliveryDate || '2026-09-05',
      status: 'PENDING',
      totalAmount: Number(poData.totalAmount || 0),
      items: poData.items || [],
      notes: poData.notes || 'Restock request generated from inventory alert.'
    };
    orders.unshift(newPO);
    setStorage('medistock_purchase_orders', orders);
    AuthService.logAudit('PURCHASE_ORDER_CREATED', 'Manager', 'INVENTORY_MANAGER', `Created ${newPO.poNumber} ($${newPO.totalAmount})`);
    return newPO;
  },

  updatePOStatus: async (id, status) => {
    try {
      const res = await api.put(`/purchases/${id}/status`, { status });
      if (res.data) {
        AuthService.logAudit('PO_STATUS_CHANGED', 'Manager', 'INVENTORY_MANAGER', `Updated ${res.data.poNumber} to ${status} via API`);
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    const orders = getStorage('medistock_purchase_orders', INITIAL_PURCHASE_ORDERS);
    const idx = orders.findIndex(o => o.id === Number(id));
    if (idx !== -1) {
      orders[idx].status = status;
      setStorage('medistock_purchase_orders', orders);

      if (status === 'DELIVERED') {
        const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
        orders[idx].items?.forEach(item => {
          const medIdx = medicines.findIndex(m => m.name.toLowerCase() === item.medicineName?.toLowerCase());
          if (medIdx !== -1) {
            medicines[medIdx].totalQuantity += Number(item.quantity || 0);
            if (medicines[medIdx].totalQuantity > medicines[medIdx].reorderLevel) {
              medicines[medIdx].stockStatus = 'IN_STOCK';
            }
          }
        });
        setStorage('medistock_medicines_db', medicines);
      }

      AuthService.logAudit('PO_STATUS_CHANGED', 'Manager', 'INVENTORY_MANAGER', `Updated ${orders[idx].poNumber} to ${status}`);
      return orders[idx];
    }
    throw new Error('Purchase order not found');
  }
};

// ==========================================
// 5. STOCK MONITORING SERVICE
// ==========================================
export const StockMonitoringService = {
  getAlerts: async () => {
    try {
      const [lowStockRes, outOfStockRes, expiringRes, expiredRes] = await Promise.all([
        api.get('/inventory/low-stock').catch(() => ({ data: [] })),
        api.get('/inventory/out-of-stock').catch(() => ({ data: [] })),
        api.get('/expiry/expiring').catch(() => ({ data: [] })),
        api.get('/expiry/expired').catch(() => ({ data: [] }))
      ]);
      const lowStock = Array.isArray(lowStockRes.data) ? lowStockRes.data : [];
      const outOfStock = Array.isArray(outOfStockRes.data) ? outOfStockRes.data : [];
      const expiringSoon = Array.isArray(expiringRes.data) ? expiringRes.data : [];
      const expired = Array.isArray(expiredRes.data) ? expiredRes.data : [];

      if (lowStock.length > 0 || outOfStock.length > 0 || expiringSoon.length > 0 || expired.length > 0) {
        return {
          totalAlerts: lowStock.length + outOfStock.length + expiringSoon.length + expired.length,
          outOfStock,
          lowStock,
          expiringSoon,
          expired,
          lastScanTime: new Date().toISOString()
        };
      }
    } catch (err) {
      // Fallback
    }

    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    const lowStock = medicines.filter(m => m.stockStatus === 'LOW_STOCK');
    const outOfStock = medicines.filter(m => m.stockStatus === 'OUT_OF_STOCK');
    const expiringSoon = medicines.filter(m => m.expiryStatus === 'EXPIRING_SOON');
    const expired = medicines.filter(m => m.expiryStatus === 'EXPIRED');

    return {
      totalAlerts: lowStock.length + outOfStock.length + expiringSoon.length + expired.length,
      outOfStock,
      lowStock,
      expiringSoon,
      expired,
      lastScanTime: new Date().toISOString()
    };
  },

  getAdjustments: async () => {
    try {
      const res = await api.get('/inventory/history');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    await delay();
    return getStorage('medistock_adjustments_db', INITIAL_ADJUSTMENTS);
  },

  createAdjustment: async (adjData) => {
    try {
      if (adjData.medicineId) {
        const res = await api.put(`/inventory/${adjData.medicineId}/stock`, {
          type: adjData.type || 'OUT',
          quantity: Number(adjData.quantity),
          reason: adjData.reason || 'MANUAL_ADJUSTMENT',
          notes: adjData.notes || ''
        });
        if (res.data) {
          AuthService.logAudit('STOCK_ADJUSTED', adjData.adjustedBy || 'Staff', 'PHARMACIST', `Adjusted stock for medicine #${adjData.medicineId} via API`);
          return res.data;
        }
      }
    } catch (err) {
      // Fallback
    }

    await delay();
    const adjustments = getStorage('medistock_adjustments_db', INITIAL_ADJUSTMENTS);
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    
    const medIdx = medicines.findIndex(m => m.id === Number(adjData.medicineId));
    let previousStock = 0;
    let newStock = 0;

    if (medIdx !== -1) {
      previousStock = medicines[medIdx].totalQuantity;
      const qtyChange = Number(adjData.quantity);

      if (adjData.type === 'IN') {
        newStock = previousStock + qtyChange;
      } else {
        newStock = Math.max(0, previousStock - qtyChange);
      }

      medicines[medIdx].totalQuantity = newStock;
      if (newStock <= 0) medicines[medIdx].stockStatus = 'OUT_OF_STOCK';
      else if (newStock <= medicines[medIdx].reorderLevel) medicines[medIdx].stockStatus = 'LOW_STOCK';
      else medicines[medIdx].stockStatus = 'IN_STOCK';

      setStorage('medistock_medicines_db', medicines);
    }

    const newAdj = {
      id: Date.now(),
      medicineId: Number(adjData.medicineId),
      medicineName: adjData.medicineName || (medIdx !== -1 ? medicines[medIdx].name : 'Unknown Medicine'),
      batchNumber: adjData.batchNumber || 'ALL-BATCHES',
      type: adjData.type || 'OUT',
      reason: adjData.reason || 'MANUAL_ADJUSTMENT',
      quantity: Number(adjData.quantity),
      previousStock,
      newStock,
      adjustedBy: adjData.adjustedBy || 'Dr. Alex Mercer, PharmD',
      timestamp: new Date().toISOString(),
      notes: adjData.notes || ''
    };

    adjustments.unshift(newAdj);
    setStorage('medistock_adjustments_db', adjustments);

    AuthService.logAudit(
      'STOCK_ADJUSTED', 
      newAdj.adjustedBy, 
      'PHARMACIST', 
      `${newAdj.type === 'IN' ? 'Restocked' : 'Deducted'} ${newAdj.quantity} units of ${newAdj.medicineName} (${newAdj.reason})`
    );

    return newAdj;
  }
};

// ==========================================
// DASHBOARD AGGREGATED STATS
// ==========================================
export const DashboardService = {
  getStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.totalMedicines !== undefined) {
        return res.data;
      }
    } catch (err) {
      // Fallback
    }

    await delay();
    const medicines = getStorage('medistock_medicines_db', INITIAL_MEDICINES);
    const adjustments = getStorage('medistock_adjustments_db', INITIAL_ADJUSTMENTS);
    const categories = getStorage('medistock_categories_db', INITIAL_CATEGORIES);

    const lowStockCount = medicines.filter(m => m.stockStatus === 'LOW_STOCK').length;
    const outOfStockCount = medicines.filter(m => m.stockStatus === 'OUT_OF_STOCK').length;
    const expiringSoonCount = medicines.filter(m => m.expiryStatus === 'EXPIRING_SOON').length;
    const expiredCount = medicines.filter(m => m.expiryStatus === 'EXPIRED').length;
    const totalInventoryValue = medicines.reduce((sum, m) => sum + (m.unitPrice * m.totalQuantity), 0);

    const categoryBreakdown = categories.map(cat => ({
      categoryName: cat.name,
      count: medicines.filter(m => m.categoryId === cat.id).length
    }));

    return {
      totalMedicines: medicines.length,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredCount,
      totalInventoryValue,
      categoryBreakdown,
      recentActivities: adjustments.slice(0, 5),
      lowStockAlertList: medicines.filter(m => m.stockStatus === 'LOW_STOCK' || m.stockStatus === 'OUT_OF_STOCK'),
      expiringAlertList: medicines.filter(m => m.expiryStatus === 'EXPIRING_SOON' || m.expiryStatus === 'EXPIRED')
    };
  }
};

// Team Two direct API client modules exports for backwards compatibility
export { default as apiClient } from '../api/apiClient';
export { default as authApi } from '../api/authApi';
export { default as medicineApi } from '../api/medicineApi';
export { default as supplierApi } from '../api/supplierApi';
export { default as inventoryApi } from '../api/inventoryApi';
export { default as expiryApi } from '../api/expiryApi';

export default api;
