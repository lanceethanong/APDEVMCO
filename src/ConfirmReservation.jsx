export default function ConfirmReservation() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Confirm Reservation</h1>
            <div className="bg-gray-200 max-w-sm rounded-xl p-1 my-5">
                <p className="text-xl">Lab 2 (CCAPDEV): June 18, 2025</p>
                <p>Seat 1 (7:30, 8:00)</p>
                <p>Seat 2 (8:30)</p>
                <p>Seat 3 (9:00)</p>
            </div>
            <div className="bg-gray-200 max-w-sm rounded-xl p-1 my-5">
                <p className="text-xl">Lab 1 (CCPROG3): June 19, 2025</p>
                <p>Seat 1 (7:30, 8:00)</p>
            </div>
            <div className="bg-gray-200 max-w-sm rounded-xl p-1 my-5">
                <p className="text-xl">Lab 2 (CCAPDEV): June 20, 2025</p>
                <p>Seat 2 (8:30)</p>
                <p>Seat 3 (9:00, 13:00)</p>
            </div>
            <button className="mx-1 w-3xs py-4 px-2 rounded bg-green-600 hover:bg-green-700 transition-colors">
                  <span className="text-white text-sm">Confirm</span> 
            </button>
            <button className="mx-1 w-3xs py-4 px-2 rounded bg-red-600 hover:bg-red-700 transition-colors">
                  <span className="text-white text-sm">Cancel</span> 
            </button>
        </div>  
    );
}