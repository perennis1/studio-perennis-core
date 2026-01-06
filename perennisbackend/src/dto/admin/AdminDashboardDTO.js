export class AdminDashboardDTO {
  static from(snapshot) {
    return {
      system: {
        activeReaders: Number(snapshot.system.activeReaders ?? 0),
        reflectionFlags: Number(snapshot.system.reflectionFlags ?? 0),
        lockedCurriculum: Number(snapshot.system.lockedCurriculum ?? 0),
      },
      content: {
        activeBooks: Number(snapshot.content.activeBooks ?? 0),
        activeCourses: Number(snapshot.content.activeCourses ?? 0),
      },
    };
  }
}
