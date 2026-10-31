import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  Shield,
  Phone,
  Mail,
  Calendar,
  IdCard,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';

const Users = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalForm, setModalForm] = useState({
    fullNameAr: '',
    fullNameLatin: '',
    email: '',
    password: '',
    professionalId: '',
    dateOfBirth: '',
    phone: '',
    roleId: '',
    jobTitleAr: '',
    jobTitleFr: '',
    departmentAr: 'العمليات اللوجستية',
    departmentFr: 'Opérations Logistiques',
    status: 'active',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch users & roles
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedRole) params.role = selectedRole;
      if (selectedStatus) params.status = selectedStatus;

      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users', { params }),
        api.get('/roles'),
      ]);

      if (usersRes.data?.success) setUsers(usersRes.data.data);
      if (rolesRes.data?.success) setRoles(rolesRes.data.data);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedRole, selectedStatus]);

  const openCreateModal = () => {
    setEditingUser(null);
    setModalForm({
      fullNameAr: '',
      fullNameLatin: '',
      email: '',
      password: '',
      professionalId: `DZ-LNF-${Math.floor(1000 + Math.random() * 9000)}`,
      dateOfBirth: '1990-01-01',
      phone: '+213 ',
      roleId: roles[0]?._id || '',
      jobTitleAr: '',
      jobTitleFr: '',
      departmentAr: 'العمليات اللوجستية',
      departmentFr: 'Opérations Logistiques',
      status: 'active',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalForm({
      fullNameAr: user.fullName?.ar || '',
      fullNameLatin: user.fullName?.latin || '',
      email: user.email || '',
      password: '', // Blank unless updating
      professionalId: user.professionalId || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      phone: user.phone || '',
      roleId: user.role?._id || user.role || '',
      jobTitleAr: user.jobTitle?.ar || '',
      jobTitleFr: user.jobTitle?.fr || '',
      departmentAr: user.department?.ar || '',
      departmentFr: user.department?.fr || '',
      status: user.status || 'active',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        fullName: {
          ar: modalForm.fullNameAr,
          latin: modalForm.fullNameLatin,
        },
        email: modalForm.email,
        professionalId: modalForm.professionalId,
        dateOfBirth: modalForm.dateOfBirth || null,
        phone: modalForm.phone,
        role: modalForm.roleId,
        jobTitle: {
          ar: modalForm.jobTitleAr,
          fr: modalForm.jobTitleFr,
          en: modalForm.jobTitleFr,
        },
        department: {
          ar: modalForm.departmentAr,
          fr: modalForm.departmentFr,
          en: modalForm.departmentFr,
        },
        status: modalForm.status,
      };

      if (modalForm.password) {
        payload.password = modalForm.password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, payload);
      } else {
        await api.post('/users', payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.message?.ar ||
        err.message ||
        'حدث خطأ أثناء حفظ بيانات الموظف.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.isSeniorManagement && user.seniorityRank === 1) {
      alert('لا يمكن حذف حساب المدير العام للمؤسسة.');
      return;
    }

    if (window.confirm(`هل أنت متأكد من رغبتك في حذف حساب (${user.fullName?.ar})؟`)) {
      try {
        await api.delete(`/users/${user._id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message?.ar || 'فشل حذف المستخدم');
      }
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2.5 sm:gap-3">
            <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600 shrink-0" />
            <span className="truncate">إدارة الموظفين والمستخدمين (RBAC)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            تسجيل المستخدمين الجدد، الملفات الشخصية، وتوزيع الصلاحيات الوظيفية
          </p>
        </div>

        {hasPermission('users:create') && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all w-full sm:w-auto shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، البريد، الرقم التعريفي..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">جميع الأدوار الوظيفية</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.displayName?.ar} ({r.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط (Active)</option>
            <option value="inactive">غير نشط (Inactive)</option>
            <option value="suspended">موقوف مؤقتاً (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            جاري تحميل سجل الموظفين...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">لا يوجد موظفين يطابقون معايير البحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-6 font-bold">الموظف / الاسم الكامل</th>
                  <th className="py-4 px-4 font-bold">الرقم المهني (ID)</th>
                  <th className="py-4 px-4 font-bold">الدور والصلاحية</th>
                  <th className="py-4 px-4 font-bold">القسم والوظيفة</th>
                  <th className="py-4 px-4 font-bold">الاتصال</th>
                  <th className="py-4 px-4 font-bold">الحالة</th>
                  <th className="py-4 px-6 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md">
                          {u.fullName?.ar?.slice(0, 1) || 'م'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {u.fullName?.ar}
                            {u.isSeniorManagement && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-extrabold border border-amber-500/30">
                                إدارة عليا
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">{u.fullName?.latin}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {u.professionalId}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${u.role?.color || '#3b82f6'}20`,
                          color: u.role?.color || '#3b82f6',
                        }}
                      >
                        <Shield className="w-3 h-3" />
                        {u.role?.displayName?.ar || u.role?.name || 'مستخدم'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {u.jobTitle?.ar || 'غير محدد'}
                      </div>
                      <div className="text-xs text-slate-400">{u.department?.ar}</div>
                    </td>

                    <td className="py-4 px-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono dir-ltr">{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {u.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> نشط
                        </span>
                      ) : u.status === 'suspended' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> موقوف
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400">
                          <XCircle className="w-3 h-3" /> غير نشط
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hasPermission('users:edit') && (
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-brand-600 transition-colors"
                            title="تعديل الملف الشخصي"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('users:delete') && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition-colors"
                            title="حذف الموظف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 my-8 text-right">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {editingUser ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد في المنصة'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              يرجى إدخال كامل البيانات المهنية بدقة وفقاً للهيكل الإداري
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكامل (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.fullNameAr}
                    onChange={(e) => setModalForm({ ...modalForm, fullNameAr: e.target.value })}
                    placeholder="مثال: رحموني وناس"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكامل (بالأحرف اللاتينية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.fullNameLatin}
                    onChange={(e) => setModalForm({ ...modalForm, fullNameLatin: e.target.value })}
                    placeholder="ex: RAHMOUNI OUNES"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني المهني *
                  </label>
                  <input
                    type="email"
                    required
                    value={modalForm.email}
                    onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                    placeholder="name@loginaft.dz"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الرقم المهني التعريفي (Professional ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.professionalId}
                    onChange={(e) => setModalForm({ ...modalForm, professionalId: e.target.value })}
                    placeholder="DZ-LNF-000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الدور الوظيفي والصلاحيات (RBAC) *
                  </label>
                  <select
                    required
                    value={modalForm.roleId}
                    onChange={(e) => setModalForm({ ...modalForm, roleId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="">اختر الدور الوظيفي</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.displayName?.ar} ({r.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف المحمول
                  </label>
                  <input
                    type="text"
                    value={modalForm.phone}
                    onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                    placeholder="+213 550 00 00 00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المسمى الوظيفي (بالعربية)
                  </label>
                  <input
                    type="text"
                    value={modalForm.jobTitleAr}
                    onChange={(e) => setModalForm({ ...modalForm, jobTitleAr: e.target.value })}
                    placeholder="مثال: مسؤول توزيع المحروقات"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    value={modalForm.dateOfBirth}
                    onChange={(e) => setModalForm({ ...modalForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    حالة الحساب
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="inactive">غير نشط (Inactive)</option>
                    <option value="suspended">موقوف مؤقتاً (Suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور الأولية *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={modalForm.password}
                    onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })}
                    placeholder={editingUser ? 'اتركه فارغاً إذا لم ترغب في التغيير' : '••••••••'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-500"
                  />
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
                  {submitting ? 'جاري الحفظ...' : editingUser ? 'تحديث البيانات' : 'تسجيل الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
