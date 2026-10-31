import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const RoleGuard = ({ permission, roles, children, fallback = null }) => {
  const { hasPermission, hasRole } = useAuth();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    if (fallback) return fallback;
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-900/40 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          صلاحيات الوصول مقيدة (Access Restricted)
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          حسابك الحالي لا يمتلك الصلاحيات الكافية ({permission || roles?.join(', ')}) لعرض أو تعديل هذه الصفحة.
          يرجى التواصل مع إدارة النظام أو المدير العام لترقية الصلاحيات.
        </p>
      </div>
    );
  }

  return children;
};

export default RoleGuard;
