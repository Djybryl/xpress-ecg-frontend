// Types pour les rôles utilisateur
export type UserRole = 'cardiologue' | 'medecin' | 'secretaire' | 'admin';

// Permissions par rôle
export interface RolePermissions {
  canAnalyzeECG: boolean;
  canUploadECG: boolean;
  canAssignECG: boolean;
  canSendReports: boolean;
  canManageUsers: boolean;
  canManageHospitals: boolean;
  canViewStatistics: boolean;
  canRequestSecondOpinion: boolean;
  canProvideSecondOpinion: boolean;
  canManagePatients: boolean;
  canAccessAdmin: boolean;
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  cardiologue: {
    canAnalyzeECG: true,
    canUploadECG: false,
    canAssignECG: false,
    canSendReports: true,
    canManageUsers: false,
    canManageHospitals: false,
    canViewStatistics: true,
    canRequestSecondOpinion: true,
    canProvideSecondOpinion: true,
    canManagePatients: false,
    canAccessAdmin: false,
  },
  medecin: {
    canAnalyzeECG: false,
    canUploadECG: true,
    canAssignECG: false,
    canSendReports: false,
    canManageUsers: false,
    canManageHospitals: false,
    canViewStatistics: true,
    canRequestSecondOpinion: false,
    canProvideSecondOpinion: false,
    canManagePatients: true,
    canAccessAdmin: false,
  },
  secretaire: {
    canAnalyzeECG: false,
    canUploadECG: true,
    canAssignECG: true,
    canSendReports: true,
    canManageUsers: false,
    canManageHospitals: false,
    canViewStatistics: true,
    canRequestSecondOpinion: false,
    canProvideSecondOpinion: false,
    canManagePatients: true,
    canAccessAdmin: false,
  },
  admin: {
    canAnalyzeECG: false,
    canUploadECG: false,
    canAssignECG: false,
    canSendReports: false,
    canManageUsers: true,
    canManageHospitals: true,
    canViewStatistics: true,
    canRequestSecondOpinion: false,
    canProvideSecondOpinion: false,
    canManagePatients: false,
    canAccessAdmin: true,
  },
};

// Fonction pour vérifier une permission
export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return rolePermissions[role]?.[permission] ?? false;
}

// Fonction pour obtenir toutes les permissions d'un rôle
export function getPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role];
}
