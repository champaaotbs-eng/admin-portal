export const errorsEn = {
    // Locations
    location_not_found: 'Location not found',
    location_already_used_in_routes: 'Location is already used in routes and critical fields cannot be changed',

    // Routes
    route_not_found: 'Route not found',
    route_already_used_in_trips: 'Route is already used in trips and cannot be changed',

    // Route stops
    route_stop_not_found: 'Route stop not found',
    route_stop_already_used_in_trips: 'Route stop is already used in trips and cannot be changed',

    // Buses
    bus_not_found: 'Bus not found',
    bus_version_not_found: 'Bus version not found',
    bus_version_already_used_in_trips: 'Bus version is already used in trips',
    bus_active_version_conflict: 'Bus already has an active version',

    // Seat layouts
    seat_layout_not_found: 'Seat layout not found',
    seat_layout_already_assigned_to_bus: 'Seat layout is assigned to a bus and cannot be deleted',
    seat_already_used_in_bookings: 'Seat is already used in bookings and cannot be changed',

    // Trips
    trip_not_found: 'Trip not found',
    trip_cannot_be_modified: 'Trip cannot be modified in this status',
    trip_already_cancelled: 'Trip is already cancelled',
    trip_already_completed: 'Trip is already completed',

    // Bookings
    booking_not_found: 'Booking not found',
    booking_cannot_be_cancelled: 'Booking cannot be cancelled in this status',
    seat_already_booked: 'Seat is already booked, please choose another seat',
    trip_not_available: 'Trip is not available',
    forbidden_booking_access: 'You do not have permission to view this booking',

    // Payments
    payment_not_found: 'Payment not found',
    payment_already_processed: 'Payment has already been processed',
    invalid_payment_signature: 'Invalid payment signature',

    // Settlements
    settlement_not_found: 'Settlement not found',
    settlement_period_overlap: 'Settlement period overlaps an existing period',
    settlement_already_paid: 'Settlement has already been paid',

    // General
    forbidden_company_resource: 'You do not have permission to perform this action',
    internal_server_error: 'An unexpected error occurred. Please try again later',
    unauthorized: 'Session expired. Please sign in again',
}
