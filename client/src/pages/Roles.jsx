import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Check, Plus, Edit2, Trash2, Lock, CheckCircle2 } from 'lucide-react';

const Roles = () => {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  // Edit / Create role state
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayNameAr: '',
    displayNameFr: '',
    displayNameEn: '',
    descriptionAr: '',
    descriptionFr: '',
    descriptionEn: '',
    permissions: [],
    color: '#3b82f6',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roles');
      if (res.data?.success) {
        setRoles(res.data.data);
        setAvailablePermissions(res.data.availablePermissions || []);
        if (res.data.data.length > 0 && !selectedRole) {
          setSelectedRole(res.data.data[0]);
        } else if (selectedRole) {
          const updated = res.data.data.find((r) => r._id === selectedRole._id);
          setSelectedRole(updated || res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch roles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      displayNameAr: '',
      displayNameFr: '',
      displayNameEn: '',
      descriptionAr: '',
      descriptionFr: '',
      descriptionEn: '',
      permissions: [],
      color: '#3b82f6',
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      displayNameAr: role.displayName?.ar || '',
      displayNameFr: role.displayName?.fr || '',
      displayNameEn: role.displayName?.en || '',
      descriptionAr: role.description?.ar || '',
      descriptionFr: role.description?.fr || '',
      descriptionEn: role.description?.en || '',
      permissions: [...(role.permissions || [])],
      color: role.color || '#3b82f6',
    });
    setError(null);
    setShowModal(true);
  };

  const togglePermission = (permKey) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(permKey);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permKey) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permKey] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: roleForm.name,
        displayName: {
          ar: roleForm.displayNameAr,
          fr: roleForm.displayNameFr,
          en: roleForm.displayNameEn,
        },
        description: {
          ar: roleForm.descriptionAr,
          fr: roleForm.descriptionFr,
          en: roleForm.descriptionEn,
        },
        permissions: roleForm.permissions,
        color: roleForm.color,
      };

      if (editingRole) {
        await api.put(`/roles/${editingRole._id}`, payload);
      } else {
        await api.post('/roles', payload);
      }

      setShowModal(false);
      fetchRoles();
    } catch (err) {
      setError(
        err.response?.data?.message?.ar ||
        err.message ||
        'حدث خطأ أثناء حفظ الدور الوظيفي.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      alert('لا يمكن حذف الأدوار الافتراضية للنظام.');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف الدور (${role.displayName?.ar})؟`)) {
      try {
        await api.delete(`/roles/${role._id}`);
        fetchRoles();
      } catch (err) {
        alert(err.response?.data?.message?.ar || 'فشل حذف الدور');
      }
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">إدارة الأدوار والصلاحيات (RBAC)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تخصيص مستويات الوصول الدقيقة لكل وظيفة
          </p>
        </div>

        {hasPermission('roles:create') && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دور جديد</span>
          </button>
        )}
      </div>

      {/* Main Grid: Roles List + Detailed Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Roles Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            الأدوار الوظيفية المعتمدة ({roles.length})
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">جاري تحميل الأدوار...</div>
          ) : (
            roles.map((r) => {
              const isSelected = selectedRole?._id === r._id;
              return (
                <div
                  key={r._id}
                  onClick={() => setSelectedRole(r)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-brand-500 shadow-md ring-2 ring-brand-500/20'
                      : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-750 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
                      style={{ backgroundColor: `${r.color}20`, color: r.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></span>
                      {r.name}
                    </span>
                    {r.isSystem && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> نظامي
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {r.displayName?.ar}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{r.displayName?.fr}</div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {r.description?.ar || 'لا يوجد وصف مخصص'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      الصلاحيات:{' '}
                      <strong className="text-slate-700 dark:text-slate-200 font-mono">
                        {r.permissions?.includes('*') ? 'كاملة (*)' : r.permissions?.length || 0}
                      </strong>
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {hasPermission('roles:edit') && (
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!r.isSystem && hasPermission('roles:delete') && (
                        <button
                          onClick={() => handleDeleteRole(r)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Permissions Matrix View */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          {selectedRole ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-700 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedRole.displayName?.ar}
                    </h2>
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold"
                      style={{ backgroundColor: `${selectedRole.color}20`, color: selectedRole.color }}
                    >
                      {selectedRole.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedRole.description?.ar}
                  </p>
                </div>

                {hasPermission('roles:edit') && (
                  <button
                    onClick={() => openEditModal(selectedRole)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل الصلاحيات</span>
                  </button>
                )}
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs">
                    <tr>
                      <th className="py-3 px-4 font-bold">الوحدة البرمجية (Module)</th>
                      <th className="py-3 px-3 font-bold text-center">عرض (View)</th>
                      <th className="py-3 px-3 font-bold text-center">إنشاء (Create)</th>
                      <th className="py-3 px-3 font-bold text-center">تعديل (Edit)</th>
                      <th className="py-3 px-3 font-bold text-center">حذف (Delete)</th>
                      <th className="py-3 px-3 font-bold text-center">تصدير (Export)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {availablePermissions.map((mod) => {
                      const isSuper = selectedRole.permissions?.includes('*');
                      const hasModWildcard = selectedRole.permissions?.includes(`${mod.module}:*`);

                      return (
                        <tr key={mod.module} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/50">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {mod.label?.ar}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{mod.module}</div>
                          </td>

                          {['view', 'create', 'edit', 'delete', 'export'].map((act) => {
                            const isApplicable = mod.actions.includes(act);
                            const permKey = `${mod.module}:${act}`;
                            const isGranted =
                              isSuper ||
                              hasModWildcard ||
                              selectedRole.permissions?.includes(permKey);

                            return (
                              <td key={act} className="py-3.5 px-3 text-center">
                                {!isApplicable ? (
                                  <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>
                                ) : isGranted ? (
                                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                                    <Check className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto text-xs font-mono">
                                    ×
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">اختر دوراً لعرض مصفوفة صلاحياته.</div>
          )}
        </div>
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 my-8 text-right">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {editingRole ? `تعديل صلاحيات الدور: ${editingRole.displayName?.ar}` : 'إنشاء دور وظيفي جديد'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              حدد الصلاحيات المسموحة لهذا الدور عبر النقر على المربعات المناسبة
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الدور المعرف (Code Name) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingRole?.isSystem}
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })}
                    placeholder="ex: REGIONAL_SUPERVISOR"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم المعروض (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.displayNameAr}
                    onChange={(e) => setRoleForm({ ...roleForm, displayNameAr: e.target.value })}
                    placeholder="مثال: مشرف التوزيع الجهوي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  وصف المهام والمسؤوليات
                </label>
                <textarea
                  rows="2"
                  value={roleForm.descriptionAr}
                  onChange={(e) => setRoleForm({ ...roleForm, descriptionAr: e.target.value })}
                  placeholder="وصف مختصر لمجال عمل هذا الدور..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              {/* Interactive Permissions Checkbox Matrix */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                  <span>الصلاحيات الممنوحة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const allPerms = [];
                      availablePermissions.forEach((mod) => {
                        mod.actions.forEach((act) => allPerms.push(`${mod.module}:${act}`));
                      });
                      setRoleForm({ ...roleForm, permissions: allPerms });
                    }}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    تحديد الكل
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {availablePermissions.map((mod) => (
                    <div
                      key={mod.module}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                        {mod.label?.ar} ({mod.module})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mod.actions.map((act) => {
                          const permKey = `${mod.module}:${act}`;
                          const isChecked = roleForm.permissions.includes(permKey);

                          return (
                            <label
                              key={act}
                              className={`cursor-pointer px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                                isChecked
                                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                onChange={() => togglePermission(permKey)}
                              />
                              {isChecked && <Check className="w-3 h-3" />}
                              <span>
                                {act === 'view'
                                  ? 'عرض'
                                  : act === 'create'
                                  ? 'إنشاء'
                                  : act === 'edit'
                                  ? 'تعديل'
                                  : act === 'delete'
                                  ? 'حذف'
                                  : 'تصدير'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2"
                >
                  {submitting ? 'جاري الحفظ...' : editingRole ? 'تحديث الصلاحيات' : 'إنشاء الدور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
