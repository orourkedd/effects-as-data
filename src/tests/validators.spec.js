const { testFn, args } = require("../test");
const { call, promisify } = require("../index");

test("validator get called during unit test", () => {
  function* subject() {
    return "foo";
  }
  subject.validator = user => {
    if (!user) throw new Error("User required.");
  };
  try {
    testFn(subject, () => {
      return args().returns("foo");
    })();
  } catch (e) {
    expect(e.message).toEqual("User required.");
    return;
  }
  fail("testFn did not throw");
});

test("validator get called inside call function inside unit test", () => {
  const user = {};
  function* test() {
    return yield call(subject, user);
  }
  function* subject() {
    return "foo";
  }
  subject.validator = user => {
    if (!user) throw new Error("User required.");
  };
  try {
    testFn(test, () => {
      // prettier-ignore
      return args()
        .cmd(call(subject))
        .returns("foo");
    })();
  } catch (e) {
    expect(e.message).toEqual("User required.");
    return;
  }
  fail("testFn did not throw");
});

test("validator get called inside call function from inside ead function", () => {
  const user = {};
  function* test() {
    return yield call(subject);
  }
  function* subject() {
    return "foo";
  }
  subject.validator = user => {
    if (!user) throw new Error("User required.");
  };
  try {
    testFn(test, () => {
      // prettier-ignore
      return args()
        .cmd(call(subject, user))
        .returns("foo");
    })();
  } catch (e) {
    expect(e.message.match(/expect/gi)).toBeTruthy();
    return;
  }
  fail("testFn did not throw");
});

test("validator get called during runtime", async () => {
  function* subject() {
    return "foo";
  }
  subject.validator = user => {
    if (!user) throw new Error("User required.");
  };
  try {
    await promisify(subject)();
  } catch (e) {
    expect(e.message).toEqual("User required.");
    return;
  }
  fail("validator did not throw");
});
