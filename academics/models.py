import uuid
from django.db import models

class ClassLevel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True) # যেমন: Class 6, Class 10

    def __str__(self):
        return self.name

class Section(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50) # যেমন: Padma, Meghna
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='sections')

    def __str__(self):
        return f"{self.name} ({self.class_level.name})"

class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True) # যেমন: Science, Arts, Commerce

    def __str__(self):
        return self.name

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"