export const COMPANY_ROLES = ['owner', 'manager', 'driver', 'agent'] as const
export type CompanyRole = typeof COMPANY_ROLES[number]

export const ROLE_LABELS: Record<CompanyRole, string> = {
    owner: 'Chủ doanh nghiệp',
    manager: 'Quản lý',
    driver: 'Tài xế',
    agent: 'Đại lý',
}

export const MOCK_STAFF = [
    { id: 's1', name: 'Nguyen Van An', email: 'an.nguyen@phuongtrang.vn', phone: '0901234567', role: 'owner' as CompanyRole, isActive: true, joinedAt: '2020-01-10' },
    { id: 's2', name: 'Pham Thi Be', email: 'be.pham@phuongtrang.vn', phone: '0912345678', role: 'manager' as CompanyRole, isActive: true, joinedAt: '2021-03-15' },
    { id: 's3', name: 'Le Van Cuong', email: 'cuong.le@phuongtrang.vn', phone: '0923456789', role: 'driver' as CompanyRole, isActive: true, joinedAt: '2022-06-01' },
    { id: 's4', name: 'Tran Thi Dao', email: 'dao.tran@phuongtrang.vn', phone: '0934567890', role: 'driver' as CompanyRole, isActive: true, joinedAt: '2022-08-20' },
    { id: 's5', name: 'Hoang Van Em', email: 'em.hoang@phuongtrang.vn', phone: '0945678901', role: 'agent' as CompanyRole, isActive: false, joinedAt: '2021-11-30' },
    { id: 's6', name: 'Vu Thi Giang', email: 'giang.vu@phuongtrang.vn', phone: '0956789012', role: 'driver' as CompanyRole, isActive: true, joinedAt: '2023-02-14' },
    { id: 's7', name: 'Do Van Hung', email: 'hung.do@phuongtrang.vn', phone: '0967890123', role: 'manager' as CompanyRole, isActive: true, joinedAt: '2020-09-05' },
    { id: 's8', name: 'Bui Thi Lan', email: 'lan.bui@phuongtrang.vn', phone: '0978901234', role: 'agent' as CompanyRole, isActive: true, joinedAt: '2023-07-01' },
]

export type StaffItem = typeof MOCK_STAFF[0]
