import { Routes, Route } from "react-router-dom";
import Trips from "./trips";
import EmailSendView from "./emailsendView";
export default function Trip() {
  return (
    <Routes>
      {/* Main Trips page (Tabs) */}
      <Route index element={<Trips />} />

      {/* Send Email Page */}
     <Route path="send-email-view/:id" element={<EmailSendView />} />

    </Routes>
  );
}
