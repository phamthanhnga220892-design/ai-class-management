# Admin User Management — Design Spec
Date: 2026-05-16

## Overview

Add a user management page to the admin panel at `/admin/users`. Admin can view all registered users, search by name/email, delete a user, and reset any user's password by typing a new one directly.

## Goals

- List all users in the system (all roles)
- Search/filter by name or email (client-side)
- Delete a user (with protection: admin cannot delete themselves)
- Reset a user's password (admin types the new password directly)

## Backend

### New file: `backend/src/users/admin-users.controller.ts`

Controller prefix: `/admin/users`. All routes guarded by `JwtAuthGuard + RolesGuard + @Roles(UserRole.ADMIN)`.

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/admin/users` | `findAll()` | List all users |
| DELETE | `/admin/users/:id` | `deleteUser()` | Delete user by id |
| PATCH | `/admin/users/:id/reset-password` | `resetPassword()` | Set new password |

**Request/Response shapes:**

`GET /admin/users` → `User[]` (fields: `_id, fullName, email, role, isActive, createdAt`)

`DELETE /admin/users/:id` → `{ message: string }` or throws `ForbiddenException` if deleting self

`PATCH /admin/users/:id/reset-password` body: `{ newPassword: string }` → `{ message: string }`

### Modifications to `backend/src/users/users.service.ts`

Add three methods:

**`findAll(): Promise<UserDocument[]>`**
```typescript
return this.userModel
    .find()
    .select('-password')
    .sort({ createdAt: -1 })
    .lean()
    .exec();
```

**`deleteUser(adminId: string, targetId: string): Promise<void>`**
- Throws `ForbiddenException('Không thể xóa tài khoản của chính mình')` if `adminId === targetId`
- Throws `NotFoundException` if user not found
- Calls `this.userModel.findByIdAndDelete(targetId)`

**`resetPassword(targetId: string, newPassword: string): Promise<void>`**
- Throws `NotFoundException` if user not found
- bcrypt hash newPassword (saltRounds = 10)
- `$set: { password: hashedPassword }`

### DTO: `ResetPasswordDto`

```typescript
export class ResetPasswordDto {
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
}
```

### Modifications to `backend/src/users/users.module.ts`

Register `AdminUsersController` in the module's `controllers` array.

## Frontend

### New file: `frontend/src/app/admin/users/page.tsx`

**State:**
- `users: User[]` — full list from API
- `search: string` — client-side filter string
- `resetTarget: User | null` — user currently being password-reset
- `newPassword: string` — input value in reset modal
- `showPassword: boolean` — toggle visibility
- `submitting: boolean`
- `successMsg: string`

**Filtered list:** `filteredUsers = users.filter(u => u.fullName + u.email contains search (case-insensitive))`

**Table columns:** Avatar initial | Tên | Email | Vai trò (badge) | Ngày đăng ký | Hành động

**Avatar:** First letter of `fullName`, uppercase. ADMIN = `bg-primary/20 text-primary`, STUDENT = `bg-muted text-muted-foreground`.

**Role badge:** ADMIN = `bg-blue-100 text-blue-700`, STUDENT = `bg-gray-100 text-gray-600`.

**Action buttons per row:**
- `🔑 Reset MK` — always shown, opens reset modal
- `🗑️ Xóa` — hidden if `user._id === currentUserId` (read from localStorage `user_info`)

**Delete flow:** `window.confirm('Bạn có chắc muốn xóa user này?')` → `api.adminDeleteUser(id)` → remove from list, show success toast.

**Reset modal:**
```
Title: "🔑 Đặt lại mật khẩu"
Subtitle: user.fullName (gray)
Input: "Mật khẩu mới *" — type=password with show/hide toggle (👁)
Validation: minLength 6, shown inline
Footer: [Hủy] [Lưu mật khẩu]
```

On submit: `api.adminResetPassword(id, newPassword)` → close modal, show success toast.

### Modifications to `frontend/src/app/admin/layout.tsx`

Add to `navLinks` array (before the existing links):
```typescript
{ href: '/admin/users', label: 'Quản lý User', icon: '👥' },
```

### Additions to `frontend/src/lib/api.ts`

```typescript
adminGetUsers: () => fetchApi<User[]>('/admin/users')
adminDeleteUser: (id: string) => fetchApi<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' })
adminResetPassword: (id: string, newPassword: string) =>
    fetchApi<{ message: string }>(`/admin/users/${id}/reset-password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
    })
```

## Security constraints

- All three admin endpoints require `JwtAuthGuard + RolesGuard + ADMIN` role
- `deleteUser` server-side checks `adminId !== targetId` (cannot delete self)
- Password is bcrypt-hashed before storage — never stored or returned in plaintext
- Frontend hides the delete button for the current user but backend enforces the rule too

## Out of scope

- Pagination (load all users — acceptable for a class management system with < 1000 users)
- Activate/deactivate (isActive toggle) — not requested
- Role change — not requested
- Email notification when password is reset — not requested
