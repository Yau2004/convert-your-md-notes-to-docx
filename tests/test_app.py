from pathlib import Path

from streamlit.testing.v1 import AppTest

APP_PATH = Path(__file__).resolve().parents[1] / "app.py"


def test_app_loads_without_exception() -> None:
    app_test = AppTest.from_file(str(APP_PATH))
    app_test.run()
    assert not app_test.exception
