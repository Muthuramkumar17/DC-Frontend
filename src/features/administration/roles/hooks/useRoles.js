import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

export const ALL_PERMISSIONS = [
  "MASTER.COMPONENT.VIEW",
  "MASTER.COMPONENT.CREATE",
  "MASTER.COMPONENT.UPDATE",
  "MASTER.COMPONENT.ACTIVATE",
  "MASTER.COMPONENT.DEACTIVATE",
  "MASTER.SUBCOMPONENT.VIEW",
  "MASTER.SUBCOMPONENT.CREATE",
  "MASTER.SUBCOMPONENT.UPDATE",
  "MASTER.SUBCOMPONENT.ACTIVATE",
  "MASTER.SUBCOMPONENT.DEACTIVATE",
  "USER.VIEW",
  "USER.CREATE",
  "USER.UPDATE",
  "USER.ACTIVATE",
  "USER.DEACTIVATE",
  "USER.PERMISSION.VIEW",
  "PETTY_CASH.ENTRY.VIEW",
  "PETTY_CASH.ENTRY.CREATE",
  "PETTY_CASH.ENTRY.UPDATE_DRAFT",
  "PETTY_CASH.ENTRY.POST",
  "PETTY_CASH.ENTRY.VOID",
  "PETTY_CASH.REIMBURSEMENT.CREATE",
  "PETTY_CASH.REIMBURSEMENT.VIEW",
];

export function seedMockRoles() {
  return [
    {
      id: "role-super-admin",
      roleCode: "SUPER_ADMIN",
      roleName: "Super Admin",
      description: "Full access to every current-phase screen and operation.",
      isSystemRole: true,
      isActive: true,
      permissionCodes: [...ALL_PERMISSIONS],
      version: 1,
      createdAt: dayjs().subtract(120, "day").toISOString(),
      updatedAt: dayjs().subtract(5, "day").toISOString(),
    },
    {
      id: "role-admin",
      roleCode: "ADMIN",
      roleName: "Admin",
      description:
        "Can view all modules; create/update/post/void only when explicitly granted.",
      isSystemRole: true,
      isActive: true,
      permissionCodes: [
        "MASTER.COMPONENT.VIEW",
        "MASTER.SUBCOMPONENT.VIEW",
        "USER.VIEW",
        "PETTY_CASH.ENTRY.VIEW",
      ],
      version: 1,
      createdAt: dayjs().subtract(120, "day").toISOString(),
      updatedAt: dayjs().subtract(10, "day").toISOString(),
    },
    {
      id: "role-user",
      roleCode: "USER",
      roleName: "User",
      description:
        "Day-to-day Petty Cash operator with limited create/edit rights.",
      isSystemRole: true,
      isActive: true,
      permissionCodes: ["PETTY_CASH.ENTRY.VIEW"],
      version: 1,
      createdAt: dayjs().subtract(120, "day").toISOString(),
      updatedAt: dayjs().subtract(15, "day").toISOString(),
    },
    {
      id: "role-branch-cashier",
      roleCode: "BRANCH_CASHIER",
      roleName: "Branch Cashier",
      description: "Custom role for branch-level petty cash handling.",
      isSystemRole: false,
      isActive: true,
      permissionCodes: ["PETTY_CASH.ENTRY.VIEW", "PETTY_CASH.ENTRY.CREATE"],
      version: 1,
      createdAt: dayjs().subtract(30, "day").toISOString(),
      updatedAt: dayjs().subtract(2, "day").toISOString(),
    },
    {
      id: "role-auditor",
      roleCode: "AUDITOR",
      roleName: "Auditor",
      description: "Read-only visibility across financial and master data.",
      isSystemRole: false,
      isActive: false,
      permissionCodes: [
        "PETTY_CASH.ENTRY.VIEW",
        "MASTER.COMPONENT.VIEW",
        "MASTER.SUBCOMPONENT.VIEW",
      ],
      version: 1,
      createdAt: dayjs().subtract(60, "day").toISOString(),
      updatedAt: dayjs().subtract(40, "day").toISOString(),
    },
  ];
}

export function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useMockPermissions() {
  const granted = useMemo(
    () =>
      new Set([
        "ROLE.VIEW",
        "ROLE.CREATE",
        "ROLE.UPDATE",
        "ROLE.ACTIVATE",
        "ROLE.DEACTIVATE",
      ]),
    [],
  );
  const can = useCallback((c) => granted.has(c), [granted]);
  return { can };
}

export function useMockSnackbar() {
  const [state, setState] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const notify = useCallback(
    (message, severity = "success") =>
      setState({ open: true, message, severity }),
    [],
  );
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  return { state, notify, close };
}

export const DEFAULT_FILTERS = { search: "", status: "ALL" };

export function useMockRoles() {
  const allRef = useRef(seedMockRoles());
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });

  const applyFilters = useCallback(
    (rows, f) =>
      rows.filter((r) => {
        if (f.search) {
          const hay =
            `${r.roleCode} ${r.roleName} ${r.description}`.toLowerCase();
          if (!hay.includes(f.search.toLowerCase())) return false;
        }
        if (f.status !== "ALL" && String(r.isActive) !== f.status) return false;
        return true;
      }),
    [],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await delay(300);
      const filtered = applyFilters(allRef.current, filters);
      const start = pagination.page * pagination.pageSize;
      setRowCount(filtered.length);
      setData(filtered.slice(start, start + pagination.pageSize));
    } catch {
      setError({ message: "Unable to load roles." });
    } finally {
      setLoading(false);
    }
  }, [applyFilters, filters, pagination]);

  useEffect(() => {
    reload();
  }, [filters, pagination]);

  const createRecord = useCallback(async (payload) => {
    await delay(350);
    const record = {
      id: `role-${allRef.current.length}`,
      version: 1,
      isSystemRole: false,
      isActive: true,
      permissionCodes: [],
      ...payload,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };
    allRef.current = [record, ...allRef.current];
    return record;
  }, []);

  const updateRecord = useCallback(async (id, payload, version) => {
    await delay(300);
    let updated = null;
    allRef.current = allRef.current.map((r) => {
      if (r.id !== id) return r;
      if (r.version !== version) {
        const e = new Error("Version conflict");
        e.status = 409;
        throw e;
      }
      updated = {
        ...r,
        ...payload,
        version: r.version + 1,
        updatedAt: dayjs().toISOString(),
      };
      return updated;
    });
    return updated;
  }, []);

  const activateRecord = useCallback(async (id, version) => {
    await delay(300);
    allRef.current = allRef.current.map((r) =>
      r.id === id
        ? {
            ...r,
            isActive: true,
            version: r.version + 1,
            updatedAt: dayjs().toISOString(),
          }
        : r,
    );
  }, []);

  const deactivateRecord = useCallback(async (id, version, reason) => {
    await delay(300);
    allRef.current = allRef.current.map((r) =>
      r.id === id
        ? {
            ...r,
            isActive: false,
            version: r.version + 1,
            deactivationReason: reason,
            updatedAt: dayjs().toISOString(),
          }
        : r,
    );
  }, []);

  return {
    data,
    rowCount,
    loading,
    error,
    pagination,
    setPagination,
    filters,
    setFilters,
    reload,
    createRecord,
    updateRecord,
    activateRecord,
    deactivateRecord,
  };
}

export function formatDateTime(v) {
  return v ? dayjs(v).format("DD MMM YYYY, hh:mm A") : "—";
}
