import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { fmtDateHuman, fmtTime12 } from "@/utils/scheduling";
import jollyLogo from "@/assets/logo/Jollylight.png";

export default function ServiceAreaPrintable({ date, bookings = [], customerById = {} }) {
  return (
    <Box
      className="service-area-print-sheet"
      sx={{
        width: "100%",
        minHeight: "100%",
        boxSizing: "border-box",
        mx: "auto",
        color: "#1F2933",
        fontFamily: "Arial, sans-serif",
        "@media print": { width: "100%", minHeight: "100%", margin: "0 auto" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Box
          component="img"
          src={jollyLogo}
          alt="Jolly Home Needs"
          sx={{ display: "block", width: 180, height: "auto" }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Cleaning Services
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {fmtDateHuman(date)}
        </Typography>
      </Box>

      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          breakInside: "auto",
          "& th, & td": {
            border: "1px solid #CBD5E1",
            padding: "12px 14px",
            verticalAlign: "top",
          },
          "& th": {
            backgroundColor: "#F8FAFC",
            fontWeight: 700,
            textAlign: "left",
            fontSize: 14,
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "16%" }}>Time</th>
            <th style={{ width: "59%" }}>Customer details</th>
            <th style={{ width: "25%" }}>Customer signature</th>
          </tr>
        </thead>
        <tbody>
          {bookings.flatMap((booking, index) => {
            const customer = booking.customer || customerById[booking.customerId] || {};
            const rows = [
              <tr key={booking.id} style={{ breakInside: "avoid" }}>
                <td style={{ fontSize: 18 }}>
                  {booking.startTime ? fmtTime12(booking.startTime) : ""}
                </td>
                <td>
                  <Box sx={{ display: "grid", gap: 0.5 }}>
                    <Box sx={{ fontSize: 15 }}>Customer name: {customer.name || ""}</Box>
                    <Box sx={{ fontSize: 15 }}>
                      Contact no: {customer.phone || customer.phoneNumber || ""}
                    </Box>
                    <Box sx={{ mt: 0.5, fontSize: 18 }}>
                      Apartment name:{" "}
                      <strong>{customer.apartmentName || customer.apartmentNumber || ""}</strong>
                    </Box>
                    <Box sx={{ fontSize: 18 }}>
                      Door no: <strong>{customer.doorNo || customer.doorNumber || ""}</strong>
                    </Box>
                    <Box sx={{ fontSize: 18 }}>
                      Area: <strong>{customer.area || ""}</strong>
                    </Box>
                  </Box>
                </td>
                <td>
                  <Box sx={{ minHeight: 60 }} />
                </td>
              </tr>
            ];

            const nextBooking = bookings[index + 1];
            if (nextBooking) {
              const currentStart = timeToMinutes(booking.startTime);
              const nextStart = timeToMinutes(nextBooking.startTime);
              const serviceEnd = currentStart + Number(booking.duration || 0);
              const bufferMinutes = Math.max(0, nextStart - serviceEnd);

              if (bufferMinutes > 0) {
                rows.push(
                  <tr key={`${booking.id}-buffer`} style={{ breakInside: "avoid" }}>
                    <td style={{ fontSize: 14, fontWeight: 700, color: "#64748B" }}>
                      Buffer
                    </td>
                    <td style={{ fontSize: 14, color: "#64748B" }}>
                      Buffer time: {bufferMinutes} minutes
                    </td>
                    <td />
                  </tr>,
                );
              }
            }

            return rows;
          })}
        </tbody>
      </Box>
    </Box>
  );
}

function timeToMinutes(value) {
  if (!value) return 0;
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

