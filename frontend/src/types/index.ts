// TypeScript types matching backend schemas

export enum UserRole {
    STUDENT = 'STUDENT',
    ADMIN = 'ADMIN',
}

export interface User {
    _id: string;
    fullName: string;
    email: string;
    role: UserRole;
    phone?: string;
    createdAt: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    instructor: string | User;
    totalSessions: number;
    totalDuration: number;
    thumbnail?: string;
    createdAt: string;
}

export enum ClassStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
}

export interface Class {
    _id: string;
    course: string | Course;
    name: string;
    mentorName: string;
    startDate: string;
    endDate: string;
    schedule: string;
    maxStudents: number;
    currentStudents: number;
    status: ClassStatus;
    createdAt: string;
}

export enum RegistrationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export interface Registration {
    _id: string;
    user: string | User;
    class: string | Class;
    course: string | Course;
    status: RegistrationStatus;
    adminNote?: string;
    approvedBy?: string | User;
    approvedAt?: string;
    createdAt: string;
}

export interface CreateRegistrationDto {
    classId: string;
    studentName: string;
    studentPhone: string;
    parentName: string;
    parentPhone: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface Attachment {
    _id?: string;
    filename: string;
    url: string;
    publicId: string;
    mimetype: string;
    size: number;
}

export interface Session {
    _id: string;
    class: string | Class;
    title: string;
    content: string;
    videoUrl?: string;
    orderIndex: number;
    attachments?: Attachment[];
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    session: string | Session;
    user: string | User;
    content: string;
    parent?: string | Comment;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFile {
    publicId: string;
    url: string;
    filename: string;
    fileType: 'image' | 'video' | 'document';
}

export interface ProductThumbnail {
    publicId: string;
    url: string;
}

export interface Product {
    _id: string;
    user: string | User;
    createdBy?: string | User | null;
    title: string;
    description: string;
    link?: string;
    thumbnail?: ProductThumbnail | null;
    files: ProductFile[];
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ShowcaseResponse {
    featured: Product[];
    others: Product[];
    students: { _id: string; fullName: string }[];
}
