<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\Libraries\Encryption;

class TaskController extends Controller
{

    private $_encryption;

    public function __construct()
    {
        $this->_encryption = new Encryption(); 
    }

    /**
     * Display a listing of the resource.
     */
    public function index()//: Array
    {
        $tasks = Task::orderBy('id', 'desc')->get()->toArray();

        return response()->json([
            'status' => true,
            'encData' => $this->_encryption->encrypt('data=' . json_encode($tasks))
        ], 200);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        /*$task = Task::create([              
            'title' => $request->input('title'),
            'description' => $request->input('description')
        ]);*/

        $task = new Task([
            'title' => $request->title,
            'description' => $request->description
        ]);
        $task->save(); 
        $task->refresh();

        return response()->json([
            "taskId" => $task->id,
            "message"=> "The task successfully stored"
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task): JsonResponse
    {
        return response()->json([
            'status' => true,
            'encData' => $this->_encryption->encrypt('data=' . json_encode($task))
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): JsonResponse
    {

       $encData = $this->_encryption->decrypt($request->encData);
        $data = (array) json_decode($encData['data']);
        $task->update($data);

        /*
        //$task->update($request->all());
        $task->title = $request->title;
        $task->description = $request->description;
        $task->done = $request->done;
        $task->save();
        return response()->json(["message"=> "The task successfully updated"], 200);
        */

        return response()->json([
            'status' => true,
            'encData' => $this->_encryption->encrypt('data=' . json_encode(["message"=> "The task successfully updated"]))
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): JsonResponse
    {
        //Task::destroy($task->id);
        $task->delete();
 
        return response()->json([], 204);
    }
    
}