declare namespace NodeJS {
  export interface Global {
    testRequest: import('supertest').SuperTest<import('supertest').Test>;
  }
}
