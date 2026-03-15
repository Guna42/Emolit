from passlib.context import CryptContext
import sys

def test_bcrypt():
    print("Testing password hashing...")
    try:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        h = pwd_context.hash("testpassword123")
        print(f"Hash success: {h}")
        v = pwd_context.verify("testpassword123", h)
        print(f"Verify success: {v}")
    except Exception as e:
        print(f"❌ BCRYPT FAILED: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_bcrypt()
