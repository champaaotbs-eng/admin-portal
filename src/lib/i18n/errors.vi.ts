export const errorsVi = {
    // Company routes form
    bus_company_required: 'Nha xe la bat buoc',
    distance_required: 'Khoang cach la bat buoc',
    distance_positive: 'Khoang cach phai lon hon 0',
    estimate_duration_required: 'Thoi gian du kien la bat buoc',
    estimate_duration_positive: 'Thoi gian du kien phai lon hon 0',
    location_required: 'Diem dung la bat buoc',
    offset_required: 'Do lech thoi gian la bat buoc',
    offset_non_negative: 'Do lech thoi gian phai lon hon hoac bang 0',

    // Locations
    location_not_found: 'Không tìm thấy địa điểm',
    location_already_used_in_routes: 'Địa điểm đang được sử dụng trong tuyến đường, không thể chỉnh sửa thông tin quan trọng',

    // Routes
    route_not_found: 'Khong tim thay tuyen duong',
    route_already_used_in_trips: 'Tuyen duong dang duoc su dung trong chuyen xe, khong the thay doi',

    // Route stops
    route_stop_not_found: 'Khong tim thay diem dung',
    route_stop_already_used_in_trips: 'Diem dung dang duoc su dung trong chuyen xe, khong the thay doi',

    // Buses
    bus_not_found: 'Khong tim thay xe',
    bus_version_not_found: 'Khong tim thay phien ban xe',
    bus_version_already_used_in_trips: 'Phien ban xe dang duoc su dung trong chuyen xe',
    bus_active_version_conflict: 'Xe da co phien ban dang hoat dong',

    // Seat layouts
    seat_layout_not_found: 'Khong tim thay so do ghe',
    seat_layout_already_assigned_to_bus: 'So do ghe dang duoc su dung, khong the xoa',
    seat_already_used_in_bookings: 'Ghe da co trong don dat ve, khong the chinh sua',

    // Trips
    trip_not_found: 'Khong tim thay chuyen xe',
    trip_cannot_be_modified: 'Chuyen xe khong the chinh sua o trang thai nay',
    trip_already_cancelled: 'Chuyen xe da bi huy',
    trip_already_completed: 'Chuyen xe da hoan thanh',

    // Bookings
    booking_not_found: 'Khong tim thay don dat ve',
    booking_cannot_be_cancelled: 'Don dat ve khong the huy o trang thai nay',
    seat_already_booked: 'Ghe da duoc dat, vui long chon ghe khac',
    trip_not_available: 'Chuyen xe khong con kha dung',
    forbidden_booking_access: 'Ban khong co quyen xem don dat ve nay',

    // Payments
    payment_not_found: 'Khong tim thay thong tin thanh toan',
    payment_already_processed: 'Thanh toan da duoc xu ly',
    invalid_payment_signature: 'Chu ky thanh toan khong hop le',

    // Settlements
    settlement_not_found: 'Khong tim thay ky quyet toan',
    settlement_period_overlap: 'Ky quyet toan bi trung voi ky da ton tai',
    settlement_already_paid: 'Ky quyet toan da duoc thanh toan',

    // General
    forbidden_company_resource: 'Ban khong co quyen thuc hien thao tac nay',
    internal_server_error: 'Da xay ra loi, vui long thu lai sau',
    unauthorized: 'Phien dang nhap da het han, vui long dang nhap lai',
}
