from tortoise.models import Model
from tortoise import fields


class Todo(Model):
    id = fields.IntField(primary_key=True)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    done = fields.BooleanField(default=False)
    reminder_at = fields.DatetimeField(null=True)
    priority = fields.CharField(max_length=10, null=True)
    due_date = fields.DatetimeField(null=True)
    tags = fields.CharField(max_length=255, null=True)
    user: int = fields.ForeignKeyField(
        "models.User", related_name="todos", on_delete=fields.CASCADE
    )
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "todos"


