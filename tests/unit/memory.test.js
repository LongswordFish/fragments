const { listFragments, writeFragment, readFragment, writeFragmentData, readFragmentData,
  deleteFragment } = require('../../src/model/data/memory');


describe('Data Model Test', () => {

  test('writefragment(fragment) will return nothing and will add the fragment into the data base', async () => {
    const fragment = {
      ownerId: "testOwnerId1",
      id: "testId1",
      data: {
        info: "testInfo1"
      }
    }

    //assert it will return nothing
    const result = await writeFragment(fragment);
    expect(result).toBe(undefined);

    //assert the fragment is added into the database
    const fragmentsIds = await listFragments(fragment.ownerId);
    expect(fragmentsIds[0]).toBe(fragment.id);

    const fragments = await listFragments(fragment.ownerId, true);
    expect(fragments[0]).toBe(fragment);
  });

  test('writefragment(ownerId, id, value) will return nothing and will add the fragment into the data base', async () => {
    const fragment = {
      ownerId: "testOwnerId2",
      id: "testId2",
      data: {
        info: "testInfo2"
      }
    }

    //assert it will return nothing
    const result = await writeFragmentData(fragment.ownerId, fragment.id, fragment.data);
    expect(result).toBe(undefined);
  });

  test('readFragment(ownerId, id) will return the metadata', async () => {
    const fragment = {
      ownerId: "testOwnerId1",
      id: "testId1",
      data: {
        info: "testInfo1"
      }
    }
    await writeFragment(fragment);
    const { ownerId, id } = fragment;
    //assert it will return nothing
    const result = await readFragment(ownerId, id);
    expect(result).toBe(fragment);
  });

  test('readFragmentData(ownerId, id) will return the data', async () => {
    const fragment = {
      ownerId: "testOwnerId",
      id: "testId",
      data: {
        info: "testInfo"
      }
    }
    await writeFragmentData(fragment.ownerId, fragment.id, fragment.data);
    const { ownerId, id } = fragment;
    const result = await readFragmentData(ownerId, id);
    expect(result).toBe(fragment.data);
  });
  test('Student case - https://github.com/humphd/ccp555-winter-2022/discussions/53', async () => {
    // Create 3 pretend fragments for owner=aa, and put some data in each

    // fragment1 metadata and data
    await writeFragment({ ownerId: 'aa', id: '1', fragment: 'pretend fragment 1' });
    await writeFragmentData('aa', '1', 'This is fragment 1');

    // fragment2 metadata and data
    await writeFragment({ ownerId: 'aa', id: '2', fragment: 'pretend fragment 2' });
    await writeFragmentData('aa', '2', 'This is fragment 2');

    // fragment3 metadata and data
    await writeFragment({ ownerId: 'aa', id: '3', fragment: 'pretend fragment 3' });
    await writeFragmentData('aa', '3', 'This is fragment 3');

    // 1. Get back a list of only fragment ids for owner=aa
    const ids = await listFragments('aa');
    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toEqual(['1', '2', '3']);

    // 2. Get back a list of expanded fragments for owner=aa
    const fragments = await listFragments('aa', true);
    expect(Array.isArray(fragments)).toBe(true);
    expect(fragments).toEqual([
      { ownerId: 'aa', id: '1', fragment: 'pretend fragment 1' },
      { ownerId: 'aa', id: '2', fragment: 'pretend fragment 2' },
      { ownerId: 'aa', id: '3', fragment: 'pretend fragment 3' },
    ]);
  });

});
