export class StudentInfoDto {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    registeredAt: Date;
}

export class SessionSummaryDto {
    _id: string;
    title: string;
    orderIndex: number;
    commentCount: number;
    createdAt: Date;
}

export class ClassDetailsResponseDto {
    class: {
        _id: string;
        name: string;
        course: {
            _id: string;
            name: string;
        };
        mentorName: string;
        startDate: Date;
        status: string;
    };
    students: StudentInfoDto[];
    sessions: SessionSummaryDto[];
    totalStudents: number;
}
