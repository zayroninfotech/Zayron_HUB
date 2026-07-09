from django.db import models


class Project(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('on_hold', 'On Hold'), ('completed', 'Completed')]
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateField(null=True, blank=True)
    assigned_employees = models.ManyToManyField('employees.Employee', blank=True, related_name='assigned_projects')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = [('todo', 'To Do'), ('in_progress', 'In Progress'), ('done', 'Done')]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    screenshot = models.ImageField(upload_to='projects/screenshots/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class UserStory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='user_stories')
    story = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.story[:60]
