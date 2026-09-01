import { useState } from "react";
import { Plus, Users as UsersIcon } from "lucide-react";
import { useData } from "../context/DataContext";
import Modal from "../components/ui/Modal";

const ROLE_TONE = {
  Admin: "bg-crit-light text-crit",
  Pharmacist: "bg-primary-light text-primary",
  Staff: "bg-info-light text-info",
};

export default function Users() {
  const { users } = useData();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Users &amp; roles</h2>
          <p className="text-sm text-muted">{users.length} accounts · Admin, Pharmacist, Staff</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="focus-ring flex items-center gap-1.5 rounded bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus size={15} /> Invite user
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-xs text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-light font-display text-xs font-semibold text-primary">
                      {u.name.slice(0, 1)}
                    </span>
                    <span className="font-medium text-ink">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_TONE[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-muted">{u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a user">
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-light text-primary">
            <UsersIcon size={20} />
          </span>
          <p className="text-sm text-ink">User invitations are issued by the backend once connected.</p>
          <p className="max-w-xs text-xs text-muted">
            Wire this form to <code className="rounded bg-bg px-1 py-0.5 font-mono">POST /api/users/invite</code> on
            the Spring Boot User &amp; Role Management Service.
          </p>
        </div>
      </Modal>
    </div>
  );
}
