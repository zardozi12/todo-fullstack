from typing import Dict

TORTOISE_ORM: Dict = {
    "connections": {"default": "sqlite://db.sqlite3"},
    "apps": {
        "models": {
            "models": ["models.user","models.todo", "aerich.models"],
            "default_connection": "default",
        }
    },
}
