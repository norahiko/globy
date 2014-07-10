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

bool ReaddirImpl(const char* path, Local<Array>& result);
bool ExistsImpl(const char* path);
bool IsCurrentDir(const char* path);


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

bool IsSymbolicLinkImpl(const char* path) {
    struct stat st;
    int err = lstat(path, &st);
    if(err) {
        return false;
    }

    return st.st_mode & S_IFLNK;
}


bool ExistsImpl(const char* path) {
    struct stat st;
    return stat(path, &st) == 0;
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


NAN_METHOD(IsSymbolicLink) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    String::Utf8Value path(args[0]);
    bool is_sym = IsSymbolicLinkImpl(*path);
    NanReturnValue(is_sym ? NanTrue() : NanFalse());
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
    NanReturnValue(Null());
}


void Init(Handle<Object> exports) {
    NanScope();

    NODE_SET_METHOD(exports, "readdirSyncSafe", ReaddirSyncSafe);
    NODE_SET_METHOD(exports, "isSymbolicLink", IsSymbolicLink);
    NODE_SET_METHOD(exports, "existsSync", ExistsSync);
    NODE_SET_METHOD(exports, "test", Test);
}


NODE_MODULE(speedup, Init)
