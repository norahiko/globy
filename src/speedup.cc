#include <node.h>
#include <nan.h>
#include <stdlib.h>
#include <iostream>

#ifdef _MSC_VER
// Windows header

// TODO: add header

#else
// Unix header

# include <dirent.h>
# include <sys/stat.h>

#endif


using namespace v8;


// Type signature

_NAN_METHOD_RETURN_TYPE IsDirectory(_NAN_METHOD_ARGS_TYPE);
_NAN_METHOD_RETURN_TYPE IsSymbolicLink(_NAN_METHOD_ARGS_TYPE);

bool ReaddirImpl(const char* path, Local<Array>& result);
bool StatSyncImpl(const char*, bool use_lstat, Local<Object>& result);
bool ExistsImpl(const char* path);
bool IsCurrentDir(const char* path);


// Template

Persistent<ObjectTemplate> stat_template;


#ifdef _MSC_VER
// Windows system call

// TODO: implement

#else
// Unix system call

bool ReaddirImpl(const char* path, Local<Array>& result) {
    if(path == NULL) {
        return false;
    }

    struct dirent** namelist;
    int size = scandir(path, &namelist, NULL, alphasort);
    if(size < 0) {
        return false;
    }

    int index = 0;
    for(int i = 0; i < size; i++) {
        const char* n = namelist[i]->d_name;

        if(! IsCurrentDir(n)) {
            Local<String> name = NanNew<String>(n);
            result->Set(NanNew<Number>(index++), name);
        }
        free(namelist[i]);
    }

    free(namelist);
    return true;
}


bool StatSyncImpl(const char* path, bool use_lstat, Local<Object>& result) {
    struct stat stat_st;
    int err;
    if(use_lstat) {
        err = lstat(path, &stat_st);
    } else {
        err = stat(path, &stat_st);
    }

    if(err) {
        return false;
    }

    result->Set(NanNew<String>("mode"), NanNew<Number>(stat_st.st_mode));
    return true;
}

bool ExistsImpl(const char* path) {
    struct stat stat_st;
    return stat(path, &stat_st) == 0;
}


NAN_METHOD(IsDirectory) {
    NanScope();
    Local<Object> stat = args.This();
    int mode = stat->Get(NanNew<String>("mode"))->IntegerValue();
    NanReturnValue((mode & S_IFDIR) ? NanTrue() : NanFalse());
}


NAN_METHOD(IsSymbolicLink) {
    NanScope();
    Local<Object> stat = args.This();
    int mode = stat->Get(NanNew<String>("mode"))->IntegerValue();
    NanReturnValue((mode & S_IFLNK) ? NanTrue() : NanFalse());
}

#endif


bool IsCurrentDir(const char* name) {
    if(name[0] == '.') {
        return name[1] == '\0' || (name[1] == '.' && name[2] == '\0');
    }
    return false;
}


NAN_METHOD(ReaddirSyncSafe) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    Local<Array> result = NanNew<Array>();
    String::Utf8Value path(args[0]);

    bool success = ReaddirImpl(*path, result);

    if(success) {
        NanReturnValue(result);
    } else {
        NanReturnValue(NanNull());
    }
}


Handle<Value> StatSyncCall(_NAN_METHOD_ARGS, bool use_lstat) {
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    Local<Object> result = stat_template->NewInstance();
    String::Utf8Value path(args[0]);

    bool success = StatSyncImpl(*path, use_lstat, result);
    if(success) {
        return result;
    } else {
        return NanNull();
    }
}


NAN_METHOD(StatSyncSafe) {
    NanScope();
    NanReturnValue(StatSyncCall(args, false));
}


NAN_METHOD(LstatSyncSafe) {
    NanScope();
    NanReturnValue(StatSyncCall(args, true));
}


NAN_METHOD(ExistsSync) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    String::Utf8Value path(args[0]);
    bool exists = ExistsImpl(*path);

    NanReturnValue(exists ? NanTrue() : NanFalse());
}


NAN_METHOD(Test) {
    NanScope();
    Local<Object> stat = stat_template->NewInstance();
    NanReturnValue(stat);
}


void Init(Handle<Object> exports) {
    NanScope();

    Local<ObjectTemplate> templ = NanNew<ObjectTemplate>();
    templ->Set(NanNew<String>("mode"), NanNew<Number>(0));
    NODE_SET_METHOD(templ, "isDirectory", IsDirectory);
    NODE_SET_METHOD(templ, "isSymbolicLink", IsSymbolicLink);
    NanAssignPersistent(stat_template, templ);

    NODE_SET_METHOD(exports, "readdirSyncSafe", ReaddirSyncSafe);
    NODE_SET_METHOD(exports, "statSyncSafe", StatSyncSafe);
    NODE_SET_METHOD(exports, "lstatSyncSafe", LstatSyncSafe);
    NODE_SET_METHOD(exports, "existsSync", ExistsSync);
    NODE_SET_METHOD(exports, "test", Test);
}


NODE_MODULE(speedup, Init)
