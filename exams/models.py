from django.db import models
from django.conf import settings

class Grade(models.Model):
    name = models.CharField(max_length=5) # e.g., A+, A, B
    min_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    gpa_value = models.DecimalField(max_digits=4, decimal_places=2)
    remarks = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.min_percentage}% - {self.max_percentage}%)"

class Exam(models.Model):
    name = models.CharField(max_length=200) # e.g., 'Mid-term 2026'
    class_level = models.ForeignKey('academics.ClassLevel', on_delete=models.CASCADE)
    academic_year = models.CharField(max_length=10) # e.g., '2026'
    start_date = models.DateField()
    end_date = models.DateField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.name} - {self.class_level.name} ({self.academic_year})"

class SubjectExam(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='subject_exams')
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE)
    full_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    pass_marks = models.DecimalField(max_digits=5, decimal_places=2, default=33)
    exam_date = models.DateField()
    exam_time = models.TimeField()

    def __str__(self):
        return f"{self.subject.name} - {self.exam.name}"

class Result(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)
    entered_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.subject.name}: {self.marks_obtained}"

class AdmitCard(models.Model):
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    template = models.ForeignKey('payments.ReceiptTemplate', on_delete=models.SET_NULL, null=True, blank=True) # PDF Template
    generated_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)

    def __str__(self):
        return f"Admit Card: {self.student.name} - {self.exam.name}"

class ClassTest(models.Model):
    subject = models.ForeignKey('academics.Subject', on_delete=models.CASCADE)
    class_level = models.ForeignKey('academics.ClassLevel', on_delete=models.CASCADE)
    section = models.ForeignKey('academics.Section', on_delete=models.CASCADE)
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE)
    date = models.DateField()
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    topic = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.topic} - {self.subject.name} ({self.date})"

class ClassTestResult(models.Model):
    class_test = models.ForeignKey(ClassTest, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.marks_obtained}/{self.class_test.max_marks}"