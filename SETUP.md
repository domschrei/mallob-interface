
# Setup

## 1. Login machine

```
git clone git@github.com:domschrei/mallob-interface.git fallob
cd fallob
git clone git@github.com:domschrei/mallob.git mallob-bridged
cd mallob-bridged
git checkout fallob
git clone git@github.com:domschrei/netcat-file-bridge.git
cd ..
# Change three occurrences of "/home/schreiber/Software/fallob" to your absolute path of the fallob directory:
vim backend/fallob-configuration-defaultPaths.json
sudo bash build.sh
```

## 2. Home machine

```
git clone git@github.com:domschrei/mallob-interface.git
cd mallob-interface
# edit credentials.sh
bash connect.sh # shell outputs connection messages, but can be used to launch Mallob
```

## 3. Mallob machine

```
git clone git@github.com:domschrei/mallob.git fallob
cd fallob
git checkout fallob
git clone git@github.com:domschrei/netcat-file-bridge.git
( cd lib && bash fetch_and_build_sat_solvers.sh )
mkdir -p build; cd ./build ; cmake .. -DCMAKE_BUILD_TYPE=RELEASE -DMALLOB_ASSERT=1 -DMALLOB_USE_ASAN=0 -DMALLOB_USE_JEMALLOC=0 -DMALLOB_LOG_VERBOSITY=4 -DMALLOB_SUBPROC_DISPATCH_PATH=\"build/\" -DMALLOB_USE_GLUCOSE=1 && make -j4 ; cd ..
rm -rf logs/.api # only for subsequent (re-)starts
RDMAV_FORK_SAFE=1 mpirun -np 16 --oversubscribe build/mallob -t=1 -log=logs/.api/ -v=4 -iff
# in another shell:
netcat-file-bridge/mallob/setup_interface_at_mallob.sh
```

## 4. Login machine

```
( cd mallob-bridged/ && netcat-file-bridge/mallob/setup_interface_at_client.sh )
./start.sh
```

# Usage

## On home machine

Open browser at localhost:12346

# Cleaning up

## On login machine

* Ctrl+C
* Tear down Mallob bridge: `mallob-bridged/netcat-file-bridge/teardown.sh`

## On Mallob machine

* Tear down Mallob bridge: `netcat-file-bridge/mallob/teardown.sh`

